import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Informasi PKRS",
  description:
    "Aplikasi manajemen formulir pelaksanaan penyuluhan kelompok Promosi Kesehatan Rumah Sakit (PKRS)",
  keywords: ["PKRS", "penyuluhan kesehatan", "promosi kesehatan", "rumah sakit"],
  icons: {
    icon: [
      { url: "/images/Logo-removebg-preview.png" },
    ],
    shortcut: "/images/Logo-removebg-preview.png",
    apple: "/images/Logo-removebg-preview.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
