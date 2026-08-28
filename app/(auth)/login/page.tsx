"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, EyeOff, Loader2, AlertCircle, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

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
    <div className="min-h-screen flex overflow-hidden bg-slate-950">
      {/* ====== PANEL KIRI — Gambar & Branding Full Screen ====== */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col shrink-0">
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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/85 via-blue-900/70 to-slate-950/90" />

        {/* Konten di atas overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* Logo + Nama RS di atas */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <Image
                src="/images/Logo.jpg"
                alt="Logo RSUD Dr. M. Yunus Bengkulu"
                width={54}
                height={54}
                className="object-contain rounded-xl"
              />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">
                RSUD Dr. M. Yunus
              </p>
              <p className="text-white/70 text-sm leading-tight mt-0.5">Bengkulu</p>
            </div>
          </div>

          {/* Teks tengah */}
          <div className="my-auto max-w-md py-12">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-medium mb-5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse" />
              Promosi Kesehatan Rumah Sakit
            </span>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Sistem Penyuluhan
              <span className="block text-sky-300 font-black">PKRS Digital</span>
            </h1>

            <p className="text-white/75 text-base leading-relaxed">
              Platform pengelolaan formulir penyuluhan kelompok secara digital — efisien, terstandar, dan terdokumentasi.
            </p>
          </div>

          {/* Footer bawah */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-white/50 text-xs">
              © {new Date().getFullYear()} RSUD Dr. M. Yunus Bengkulu
            </p>
            <p className="text-white/50 text-xs font-medium">PKRS — v1.0</p>
          </div>
        </div>
      </div>

      {/* ====== PANEL KANAN — Form Selamat Datang dengan Border Radius Lengkung ====== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-14 bg-background lg:-ml-8 lg:rounded-l-[40px] xl:rounded-l-[48px] z-10 shadow-2xl relative">
        <div className="w-full max-w-md">

          {/* Logo Mobile (hanya muncul di layar kecil) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-border bg-white flex items-center justify-center">
              <Image
                src="/images/Logo.jpg"
                alt="Logo RSUD Dr. M. Yunus"
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">RSUD Dr. M. Yunus</p>
              <p className="text-xs text-muted-foreground leading-tight">Bengkulu</p>
            </div>
          </div>

          {/* Judul Form */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Masuk ke Sistem Penyuluhan PKRS — RSUD Dr. M. Yunus Bengkulu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" id="form-login">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="input-email" className="text-xs font-semibold text-foreground uppercase tracking-wider">
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
                    "placeholder:text-muted-foreground/50 border-input",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                    "transition-all duration-150"
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="input-password" className="text-xs font-semibold text-foreground uppercase tracking-wider">
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
                    "placeholder:text-muted-foreground/50 border-input",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                    "transition-all duration-150"
                  )}
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  aria-label="Tampilkan/sembunyikan password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
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
            <span className="text-xs text-muted-foreground font-medium">Info</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Info */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Belum punya akun?</span>{" "}
            Hubungi Admin atau Penanggung Jawab PKRS RSUD Dr. M. Yunus Bengkulu untuk mendapatkan akses.
          </div>
        </div>
      </div>
    </div>
  );
}
