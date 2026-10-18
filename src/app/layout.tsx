import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/context/LanguageContext";
import Providers from "@/components/Providers";
import SyncProvider from "@/components/SyncProvider";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Hanout Bladi - Épicerie Marocaine en Ligne",
  description: "Découvrez les meilleurs produits du terroir marocain bio et naturels.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" className="overflow-x-hidden">
      <body className="min-h-screen max-w-[100vw] overflow-x-hidden bg-[#F8FAF6] text-stone-900 flex flex-col font-sans">
        <Providers>
          <LanguageProvider>
            <SyncProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#3B4D3C",
                    color: "#fff",
                    borderRadius: "12px",
                  },
                }}
              />

              {/* Wrapper client pour gérer l'affichage conditionnel du Header/Footer */}
              <MainLayoutWrapper>
                {children}
              </MainLayoutWrapper>

              {/* Bouton WhatsApp Flottant */}
              <WhatsAppButton />

            </SyncProvider>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}