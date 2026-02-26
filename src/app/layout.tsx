import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/app/context/AuthUserContext';
import ProfileAvatar from "@/components/profile";
import NavLinks from "@/components/NavLinks";
import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "El Itacate — Molino de Nixtamal",
  description: "Sistema de gestión de negocio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <AuthProvider>
        <body className="antialiased bg-surface-50 text-surface-900">

          <nav className="flex justify-between items-center bg-white border-b border-surface-200 px-8 shadow-sm h-20">
            <Link href="/" className="flex items-center shrink-0 py-2">
              <Image width={180} height={90} src={logo.src} alt="El Itacate logo" />
            </Link>
            <NavLinks />
            <div className="shrink-0 pl-6">
              <ProfileAvatar />
            </div>
          </nav>

          <main className="min-h-[calc(100vh-5rem)]">
            {children}
          </main>

        </body>
      </AuthProvider>
    </html>
  );
}
