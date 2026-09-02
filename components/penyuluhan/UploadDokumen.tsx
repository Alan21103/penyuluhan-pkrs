"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JenisDokumen } from "@/types/penyuluhan";
import { compressImage, formatFileSize } from "@/lib/image-compression";
import { Loader2 } from "lucide-react";

import type { UploadedDocItem, UploadDokumenProps } from "./upload/types";
import { MAX_DOC_SIZE_MB } from "./upload/types";
import UploadGuidelines from "./upload/UploadGuidelines";
import DocCategoryCard from "./upload/DocCategoryCard";
import DocImageLightbox from "./upload/DocImageLightbox";

// Re-export types for backward compatibility
export type { UploadedDocItem, UploadDokumenProps };

export default function UploadDokumen({
  penyuluhanId,
  userId,
  dokumenChecklist,
  mode = "edit",
  stagedFiles,
  existingFiles = [],
  onUploadComplete,
  onStagedFilesChange,
}: UploadDokumenProps) {
  const supabase = createClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocItem[]>(stagedFiles || existingFiles);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [uploadingJenis, setUploadingJenis] = useState<JenisDokumen | null>(null);
  const [compressingStatus, setCompressingStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lightbox preview state
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Active cloud link form per category
  const [activeCloudCategory, setActiveCloudCategory] = useState<JenisDokumen | null>(null);

  // Sync state if stagedFiles prop changes in create mode
  useEffect(() => {
    if (mode === "create" && stagedFiles !== undefined) {
      setUploadedFiles(stagedFiles);
    }
  }, [mode, stagedFiles]);

  // Helper signed URL
  const getSignedUrl = useCallback(
    async (path: string): Promise<string> => {
      if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
        return path;
      }
      const { data } = await supabase.storage.from("penyuluhan-files").createSignedUrl(path, 3600);
      return data?.signedUrl ?? "";
    },
    [supabase]
  );

  // Load existing docs from database if not passed (edit mode)
  useEffect(() => {
    if (mode === "create" || !penyuluhanId) return;

    let isMounted = true;
    const loadFiles = async () => {
      setLoadingInitial(true);
      const { data, error } = await supabase
        .from("dokumen_upload")
        .select("*")
        .eq("penyuluhan_id", penyuluhanId);

      if (!error && data && isMounted) {
        const withUrls = await Promise.all(
          data.map(async (d: any) => {
            const isLink = d.is_external_link || d.file_url.startsWith("http");
            const url = isLink ? d.file_url : await getSignedUrl(d.file_url);
            return {
              id: d.id,
              jenis: d.jenis,
              file_name: d.file_name,
              file_path: d.file_url,
              file_size: d.file_size,
              file_type: d.file_type || (isLink ? "link" : d.jenis === "Foto Kegiatan" ? "image" : "document"),
              is_external_link: isLink,
              signed_url: url,
            };
          })
        );
        setUploadedFiles(withUrls);
      }
      if (isMounted) setLoadingInitial(false);
    };

    loadFiles();

    return () => {
      isMounted = false;
    };
  }, [penyuluhanId, mode, supabase, getSignedUrl]);

  // Handle upload file (dengan auto-compression jika foto)
  const handleFileSelect = async (jenis: JenisDokumen, rawFiles: FileList | null) => {
    if (!rawFiles || rawFiles.length === 0) return;
    setErrors((e) => ({ ...e, [jenis]: "" }));
    setUploadingJenis(jenis);

    const filesToProcess = Array.from(rawFiles);
    const newItems: UploadedDocItem[] = [];

    for (const rawFile of filesToProcess) {
      try {
        let fileToUpload: File = rawFile;
        let fileType = "document";

        // Jika foto kegiatan, lakukan kompresi client-side WebP
        if (jenis === "Foto Kegiatan" || rawFile.type.startsWith("image/")) {
          fileType = "image";
          setCompressingStatus(`Mengompresi ${rawFile.name} (${formatFileSize(rawFile.size)})...`);

          const compressed = await compressImage(rawFile, {
            maxWidth: 1280,
            maxHeight: 1280,
            quality: 0.78,
            targetFormat: "image/webp",
          });

          fileToUpload = compressed.file;
        } else {
          // Validasi dokumen non-foto
          if (rawFile.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
            setErrors((e) => ({
              ...e,
              [jenis]: `File ${rawFile.name} melebihi batas ${MAX_DOC_SIZE_MB} MB. Gunakan fitur "Tautan Cloud" untuk file berukuran besar.`,
            }));
            continue;
          }
        }

        if (mode === "create" || !penyuluhanId) {
          // CREATE MODE: Staged in memory with blob object URL
          const blobUrl = URL.createObjectURL(fileToUpload);
          const stagedItem: UploadedDocItem = {
            id: crypto.randomUUID(),
            jenis,
            file: fileToUpload,
            file_name: rawFile.name,
            file_path: blobUrl,
            file_size: fileToUpload.size,
            file_type: fileType,
            is_external_link: false,
            signed_url: blobUrl,
          };
          newItems.push(stagedItem);
        } else {
          // EDIT MODE: Direct storage & database upload
          setCompressingStatus(`Mengupload ${fileToUpload.name}...`);

          const safeName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${userId}/${penyuluhanId}/${jenis.replace(/\s+/g, "_")}/${Date.now()}_${safeName}`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("penyuluhan-files")
            .upload(path, fileToUpload, { upsert: false });

          if (uploadErr) throw new Error(`Upload gagal: ${uploadErr.message}`);

          const signedUrl = await getSignedUrl(uploadData.path);

          const { data: insertData, error: insertErr } = await supabase
            .from("dokumen_upload")
            .insert({
              penyuluhan_id: penyuluhanId,
              jenis,
              file_url: uploadData.path,
              file_name: rawFile.name,
              file_size: fileToUpload.size,
              file_type: fileType,
              is_external_link: false,
            })
            .select("id")
            .single();

          if (insertErr) console.warn("Insert meta warning:", insertErr.message);

          const newFileItem: UploadedDocItem = {
            id: insertData?.id,
            jenis,
            file_name: rawFile.name,
            file_path: uploadData.path,
            file_size: fileToUpload.size,
            file_type: fileType,
            is_external_link: false,
            signed_url: signedUrl,
          };
          newItems.push(newFileItem);
        }
      } catch (err: any) {
        setErrors((e) => ({ ...e, [jenis]: err.message || "Gagal memproses file" }));
      }
    }

    if (newItems.length > 0) {
      setUploadedFiles((prev) => {
        const updated = [...prev, ...newItems];
        onUploadComplete?.(updated);
        onStagedFilesChange?.(updated);
        return updated;
      });
    }

    setCompressingStatus(null);
    setUploadingJenis(null);
  };

  // Simpan tautan eksternal (Google Drive / Canva / YouTube)
  const handleAddCloudLink = async (jenis: JenisDokumen, title: string, url: string) => {
    const linkTitle = title || `Tautan ${jenis} (Cloud/Google Drive)`;

    if (mode === "create" || !penyuluhanId) {
      // CREATE MODE: Staged link
      const newFileItem: UploadedDocItem = {
        id: crypto.randomUUID(),
        jenis,
        file_name: linkTitle,
        file_path: url,
        file_size: 0,
        file_type: "link",
        is_external_link: true,
        signed_url: url,
      };

      setUploadedFiles((prev) => {
        const updated = [...prev, newFileItem];
        onUploadComplete?.(updated);
        onStagedFilesChange?.(updated);
        return updated;
      });
    } else {
      // EDIT MODE: Direct DB insert
      const { data: insertData, error: insertErr } = await supabase
        .from("dokumen_upload")
        .insert({
          penyuluhan_id: penyuluhanId,
          jenis,
          file_url: url,
          file_name: linkTitle,
          file_size: 0,
          file_type: "link",
          is_external_link: true,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;

      const newFileItem: UploadedDocItem = {
        id: insertData?.id,
        jenis,
        file_name: linkTitle,
        file_path: url,
        file_size: 0,
        file_type: "link",
        is_external_link: true,
        signed_url: url,
      };

      setUploadedFiles((prev) => {
        const updated = [...prev, newFileItem];
        onUploadComplete?.(updated);
        onStagedFilesChange?.(updated);
        return updated;
      });
    }
  };

  // Hapus file (storage + database di edit mode, atau revoke blob di create mode)
  const handleRemoveDoc = async (file: UploadedDocItem) => {
    try {
      if (mode === "create" || !penyuluhanId) {
        if (file.signed_url?.startsWith("blob:")) {
          URL.revokeObjectURL(file.signed_url);
        }
      } else {
        if (!file.is_external_link && file.file_path && !file.file_path.startsWith("http")) {
          await supabase.storage.from("penyuluhan-files").remove([file.file_path]);
        }

        if (file.id) {
          await supabase.from("dokumen_upload").delete().eq("id", file.id);
        } else {
          await supabase.from("dokumen_upload").delete().eq("file_url", file.file_path);
        }
      }

      setUploadedFiles((prev) => {
        const updated = prev.filter(
          (f) => f !== file && f.file_path !== file.file_path && (file.id ? f.id !== file.id : true)
        );
        onUploadComplete?.(updated);
        onStagedFilesChange?.(updated);
        return updated;
      });
    } catch (err: any) {
      console.error("Gagal menghapus file:", err);
    }
  };

  if (dokumenChecklist.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center">
        <p className="text-xs text-muted-foreground italic">
          Pilih minimal satu checklist dokumentasi di atas untuk mengaktifkan formulir upload.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Ketentuan Berkas & Dokumentasi Banner */}
      <UploadGuidelines />

      {loadingInitial && (
        <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Memuat berkas dokumentasi...
        </div>
      )}

      {/* Render kartu per checklist jenis dokumen */}
      {dokumenChecklist.map((jenis) => (
        <DocCategoryCard
          key={jenis}
          jenis={jenis}
          files={uploadedFiles.filter((f) => f.jenis === jenis)}
          isUploading={uploadingJenis === jenis}
          compressingStatus={compressingStatus}
          error={errors[jenis]}
          mode={mode}
          showCloudForm={activeCloudCategory === jenis}
          onToggleCloudForm={() =>
            setActiveCloudCategory(activeCloudCategory === jenis ? null : jenis)
          }
          onFileSelect={(files) => handleFileSelect(jenis, files)}
          onAddCloudLink={(title, url) => handleAddCloudLink(jenis, title, url)}
          onPreviewPhoto={(file) =>
            setPreviewImage({ url: file.signed_url!, title: file.file_name })
          }
          onRemoveDoc={handleRemoveDoc}
        />
      ))}

      {/* Lightbox Modal Dialog Preview Foto */}
      <DocImageLightbox
        preview={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
