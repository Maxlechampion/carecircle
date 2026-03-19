import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareCircle - Soutien Intelligent pour Aidants Familiaux",
  description: "Plateforme de soutien intelligent pour aidants familiaux. Assistant IA personnalisé, coordination des soins, communauté d'entraide et ressources éducatives.",
  keywords: ["aidants", "familiaux", "soutien", "IA", "bien-être", "soins", "communauté", "CareCircle"],
  authors: [{ name: "CareCircle Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CareCircle - Soutien Intelligent pour Aidants",
    description: "La plateforme qui accompagne les millions d'aidants familiaux",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
