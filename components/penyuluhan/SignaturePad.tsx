"use client";

import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Trash2, RotateCcw, Check, Upload, Pen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  id: string;
  label: string;
  value?: string; // base64 data URL yang sudah tersimpan
  onChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ id, label, value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inputMode, setInputMode] = useState<"draw" | "upload">("draw");
  const [mode, setMode] = useState<"pad" | "preview">(value ? "preview" : "pad");

  // Muat tanda tangan yang sudah ada
  useEffect(() => {
    if (value && canvasRef.current && mode === "pad" && inputMode === "draw") {
      const canvas = canvasRef.current;
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getCanvas().getContext("2d");
        if (ctx) {
          canvas.clear();
          ctx.drawImage(img, 0, 0, canvas.getCanvas().width, canvas.getCanvas().height);
          setHasSignature(true);
        }
      };
      img.src = value;
    }
  }, [mode, value, inputMode]);

  const handleEnd = () => {
    if (canvasRef.current && !canvasRef.current.isEmpty()) {
      setHasSignature(true);
      setSaved(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setHasSignature(false);
    setSaved(false);
    onChange(null);
  };

  const handleSave = () => {
    if (!canvasRef.current || canvasRef.current.isEmpty()) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onChange(dataUrl);
    setSaved(true);
    setMode("preview");
  };

  // Upload dari file gambar
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (JPG, PNG, dll.)");
      return;
    }

    // Validasi ukuran (maks 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maks 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
        setSaved(true);
        setHasSignature(true);
        setMode("preview");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // reset input
  };

  return (
    <div className="space-y-2">
      {mode === "preview" && value ? (
        <div className="relative group">
          {/* Preview tanda tangan */}
          <div className="h-28 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={`Tanda tangan ${label}`}
              className="max-h-24 max-w-full object-contain"
            />
          </div>
          <button
            type="button"
            id={`${id}-edit`}
            onClick={() => { setMode("pad"); setSaved(false); }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
            title="Ubah tanda tangan"
          >
            <Pen className="w-3.5 h-3.5" />
          </button>
          <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
            <Check className="w-3 h-3" /> Tanda tangan tersimpan
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Mode toggle: Gambar / Upload */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInputMode("draw")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
                inputMode === "draw"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:border-primary/40"
              )}
            >
              <Pen className="w-3 h-3" /> Gambar
            </button>
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
                inputMode === "upload"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:border-primary/40"
              )}
            >
              <Upload className="w-3 h-3" /> Upload Gambar
            </button>
          </div>

          {inputMode === "draw" ? (
            <>
              {/* Canvas area */}
              <div
                className={cn(
                  "relative rounded-xl border-2 bg-white overflow-hidden",
                  hasSignature ? "border-primary/40" : "border-dashed border-border"
                )}
              >
                <SignatureCanvas
                  ref={canvasRef}
                  penColor="#1a1a2e"
                  canvasProps={{
                    id,
                    className: "w-full h-28 touch-none",
                    style: { width: "100%", height: "112px" },
                  }}
                  onEnd={handleEnd}
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-xs text-muted-foreground/60">Tanda tangan di sini...</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  id={`${id}-clear`}
                  onClick={handleClear}
                  disabled={!hasSignature}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                >
                  <RotateCcw className="w-3 h-3" /> Ulangi
                </button>
                <button
                  type="button"
                  id={`${id}-save`}
                  onClick={handleSave}
                  disabled={!hasSignature || saved}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all",
                    hasSignature && !saved
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Check className="w-3 h-3" />
                  {saved ? "Tersimpan" : "Simpan Tanda Tangan"}
                </button>
              </div>
            </>
          ) : (
            /* Upload mode */
            <div>
              <label
                htmlFor={`${id}-file`}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                  "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Klik untuk upload tanda tangan (JPG, PNG)
                </span>
                <span className="text-[10px] text-muted-foreground/60">Maks 2 MB</span>
              </label>
              <input
                id={`${id}-file`}
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
