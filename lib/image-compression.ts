/**
 * Client-side Image Compression Utility
 * Mengompresi foto langsung di browser pengguna sebelum diupload ke Supabase Storage.
 * Mengurangi ukuran foto kamera HP (5-15 MB) menjadi ~150-300 KB (WebP/JPEG)
 * untuk menghemat kuota Supabase Free Tier (1 GB) dan bandwidth (2 GB/bulan).
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 s/d 1.0
  targetFormat?: "image/webp" | "image/jpeg";
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savingsPercent: number;
  previewUrl: string;
  width: number;
  height: number;
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.78,
  targetFormat: "image/webp",
};

/**
 * Format bytes ke string ukuran yang mudah dibaca (KB / MB)
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Mengompresi file gambar menggunakan Canvas API native browser
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    // Validasi apakah file adalah gambar
    if (!file.type.startsWith("image/")) {
      return reject(new Error("File yang dipilih bukan gambar"));
    }

    // Buat image object dari file
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Hitung dimensi rasio aspek baru
      const maxW = opts.maxWidth || 1280;
      const maxH = opts.maxHeight || 1280;

      if (width > maxW || height > maxH) {
        if (width / height > maxW / maxH) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        } else {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }
      }

      // Render ke canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) {
        return reject(new Error("Tidak dapat menginisialisasi canvas context"));
      }

      // Fill background putih untuk transparansi / WebP
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Gambar dengan smoothing berkualitas tinggi
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const targetMime = opts.targetFormat || "image/webp";
      const quality = opts.quality || 0.78;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error("Gagal mengompresi gambar"));
          }

          // Buat nama file baru dengan ekstensi sesuai mime
          const ext = targetMime === "image/webp" ? "webp" : "jpg";
          const rawName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, "_");
          const newFileName = `${cleanName}.${ext}`;

          const compressedFile = new File([blob], newFileName, {
            type: targetMime,
            lastModified: Date.now(),
          });

          const compressedSize = compressedFile.size;
          const savedBytes = Math.max(0, originalSize - compressedSize);
          const savingsPercent =
            originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;
          const previewUrl = URL.createObjectURL(blob);

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize,
            savedBytes,
            savingsPercent,
            previewUrl,
            width,
            height,
          });
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal membaca berkas gambar"));
    };

    img.src = objectUrl;
  });
}
