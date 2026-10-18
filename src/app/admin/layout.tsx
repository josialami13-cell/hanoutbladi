"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Rendu épuré pour la page de connexion admin
  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-stone-100 font-sans flex items-center justify-center p-4">
        {children}
      </main>
    );
  }

  // Layout principal Admin : Ordinateur (flex-row) & Téléphone (flex-col)
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#FAF9F5] overflow-hidden font-sans antialiased text-stone-800">
      
      {/* Barre latérale (s'adapte en haut ou en tiroir sur mobile, fixe sur desktop) */}
      <AdminSidebar />

      {/* Zone de contenu principal adaptative */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 w-full">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {children}
        </div>
      </main>

    </div>
  );
}