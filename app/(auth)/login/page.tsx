"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, EyeOff, Loader2, AlertCircle, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* ====== PANEL KIRI — Gambar & Branding ====== */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col">
        {/* Gambar Gedung RS sebagai background */}
        <Image
          src="/images/LoginImage.jpg"
          alt="RSUD Dr. M. Yunus Bengkulu"
          fill
          priority
          sizes="55vw"
          className="object-cover object-center"
        />

        {/* Overlay gradient biru */}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.20_0.08_255)]/85 via-[oklch(0.20_0.08_255)]/60 to-[oklch(0.20_0.08_255)]/90" />

        {/* Konten di atas overlay */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo + Nama RS di atas */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/images/Logo.jpg"
                alt="Logo RSUD Dr. M. Yunus Bengkulu"
                width={56}
                height={56}
                className="object-contain rounded-xl"
              />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">
                RSUD Dr. M. Yunus
              </p>
              <p className="text-white/70 text-sm leading-tight">Bengkulu</p>
            </div>
          </div>

          {/* Teks tengah */}
          <div className="flex-1 flex flex-col items-start justify-center max-w-md">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
              Promosi Kesehatan Rumah Sakit
            </span>

            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Sistem Penyuluhan
              <span className="block text-blue-300">PKRS Digital</span>
            </h1>

            <p className="text-white/70 text-base leading-relaxed mb-10">
              Platform pengelolaan formulir penyuluhan kelompok secara digital — efisien, terstandar, dan terdokumentasi.
            </p>

            {/* Fitur highlight */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                { emoji: "📋", label: "Formulir A–G" },
                { emoji: "📄", label: "Export PDF & Excel" },
                { emoji: "📊", label: "Dashboard Statistik" },
                { emoji: "🔒", label: "Akses Berbasis Peran" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5"
                >
                  <span className="text-lg">{f.emoji}</span>
                  <span className="text-sm text-white/85 font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer bawah */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} RSUD Dr. M. Yunus Bengkulu
            </p>
            <p className="text-white/40 text-xs">PKRS — v1.0</p>
          </div>
        </div>
      </div>

      {/* ====== PANEL KANAN — Form Login ====== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">

          {/* Logo Mobile (hanya muncul di layar kecil) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-border">
              <Image
                src="/images/Logo.jpg"
                alt="Logo RSUD Dr. M. Yunus"
                width={48}
                height={48}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">RSUD Dr. M. Yunus</p>
              <p className="text-xs text-muted-foreground leading-tight">Bengkulu</p>
            </div>
          </div>

          {/* Judul Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Selamat Datang</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Masuk ke Sistem Penyuluhan PKRS — RSUD Dr. M. Yunus Bengkulu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" id="form-login">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="input-email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@rsudmyunus.co.id"
                  required
                  autoComplete="email"
                  className={cn(
                    "w-full h-11 pl-10 pr-4 rounded-xl border bg-card text-foreground text-sm",
                    "placeholder:text-muted-foreground/50",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                    "transition-all duration-150 border-input"
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="input-password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={cn(
                    "w-full h-11 pl-10 pr-11 rounded-xl border bg-card text-foreground text-sm",
                    "placeholder:text-muted-foreground/50",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                    "transition-all duration-150 border-input"
                  )}
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  aria-label="Tampilkan/sembunyikan password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tombol Login */}
            <Button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold mt-2 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Info</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Belum punya akun?</span>{" "}
            Hubungi Admin atau Penanggung Jawab PKRS RSUD Dr. M. Yunus Bengkulu untuk mendapatkan akses.
          </div>
        </div>
      </div>
    </div>
  );
}
