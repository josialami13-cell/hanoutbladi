"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "./WhatsAppButton";

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  // Si nous sommes dans l'espace admin, on n'affiche ni Header ni Footer public
  if (isAdminPage) {
    return <>{children}</>;
  }

  // Pour le reste du site e-commerce, on affiche le layout complet
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}