// =============================================================
// COMPOSANT SIDEBAR NAVIGATION - Plaza D'Oliviers (5 Langues)
// =============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiTruck, FiInfo, FiMail, FiCompass, FiShoppingBag, FiGlobe } from "react-icons/fi";
import TranslatedText from "@/components/TranslatedText";
import { useLanguage } from "@/context/LanguageContext";

export default function SidebarNav() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage() as { language: string; setLanguage: (lang: string) => void };
  const isAr = language === "ar";

  // Cycle entre les 5 langues supportées (FR -> AR -> EN -> ES -> DE)
  const availableLanguages = ["fr", "ar", "en", "es", "de"];
  const handleLanguageCycle = () => {
    const currentIndex = availableLanguages.indexOf(language);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    setLanguage(availableLanguages[nextIndex]);
  };

  return (
    <aside className="hidden lg:block lg:col-span-2 sticky top-20">
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-md space-y-3" dir={isAr ? "rtl" : "ltr"}>
        
        {/* En-tête de la sidebar & Bouton de Traduction rapide */}
        <div className="space-y-2 pb-2 border-b border-stone-100 text-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-1">
              <FiCompass size={13} /> Plaza
            </span>
            
            {/* Bouton de bascule rapide entre les langues */}
            <button
              type="button"
              onClick={handleLanguageCycle}
              className="px-2 py-1 bg-[#FAF9F5] hover:bg-stone-100 border border-stone-200 rounded-lg text-[10px] font-bold text-stone-700 transition flex items-center gap-1 cursor-pointer uppercase"
              title="Changer de langue / Change language"
            >
              <FiGlobe size={11} className="text-[#C5A059]" />
              <span>{language}</span>
            </button>
          </div>

          <h3 className="font-serif font-bold text-stone-900 text-xs">
            <TranslatedText text="Navigation" arText="القائمة" enText="Navigation" esText="Navegación" deText="Navigation" />
          </h3>
        </div>

        {/* Liens de navigation principaux */}
        <nav className="space-y-1.5 text-xs font-semibold text-stone-700">
          
          <Link 
            href="/shop" 
            className={`flex items-center gap-2.5 p-2.5 rounded-2xl transition group cursor-pointer ${
              pathname.startsWith("/shop") && pathname !== "/shop/checkout" 
                ? "bg-[#2C3E2D] text-white" 
                : "bg-[#FAF9F5] hover:bg-[#2C3E2D] hover:text-white"
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-2xl transition ${
              pathname.startsWith("/shop") && pathname !== "/shop/checkout"
                ? "bg-white/20 text-white"
                : "bg-white text-[#2C3E2D] group-hover:bg-white/20 group-hover:text-white"
            }`}>
              <FiShoppingBag size={13} />
            </div>
            <span className="truncate">
              <TranslatedText text="Boutique" arText="المتجر" enText="Shop" esText="Tienda" deText="Shop" />
            </span>
          </Link>

          <Link 
            href="/about" 
            className={`flex items-center gap-2.5 p-2.5 rounded-2xl transition group cursor-pointer ${
              pathname === "/about" 
                ? "bg-[#2C3E2D] text-white" 
                : "bg-[#FAF9F5] hover:bg-[#2C3E2D] hover:text-white"
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-2xl transition ${
              pathname === "/about" ? "bg-white/20 text-white" : "bg-white text-[#2C3E2D] group-hover:bg-white/20 group-hover:text-white"
            }`}>
              <FiHome size={13} />
            </div>
            <span className="truncate">
              <TranslatedText text="Hébergement" arText="الإقامة" enText="Accommodation" esText="Alojamiento" deText="Unterkunft" />
            </span>
          </Link>

          <Link 
            href="/about" 
            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#FAF9F5] hover:bg-[#2C3E2D] hover:text-white transition group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-white text-[#2C3E2D] flex items-center justify-center shadow-2xl group-hover:bg-white/20 group-hover:text-white transition">
              <FiTruck size={13} />
            </div>
            <span className="truncate">
              <TranslatedText text="Camping-cars" arText="التخييم" enText="Campervan Pitches" esText="Camping-cars" deText="Wohnmobilstellplätze" />
            </span>
          </Link>

          <Link 
            href="/about" 
            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#FAF9F5] hover:bg-[#2C3E2D] hover:text-white transition group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-white text-[#2C3E2D] flex items-center justify-center shadow-2xl group-hover:bg-white/20 group-hover:text-white transition">
              <FiInfo size={13} />
            </div>
            <span className="truncate">
              <TranslatedText text="Notre Histoire" arText="قصتنا" enText="Our Story" esText="Nuestra Historia" deText="Unsere Geschichte" />
            </span>
          </Link>

          <Link 
            href="/contact" 
            className={`flex items-center gap-2.5 p-2.5 rounded-2xl transition group cursor-pointer ${
              pathname === "/contact" 
                ? "bg-[#2C3E2D] text-white" 
                : "bg-[#FAF9F5] hover:bg-[#2C3E2D] hover:text-white"
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-2xl transition ${
              pathname === "/contact" ? "bg-white/20 text-white" : "bg-white text-[#2C3E2D] group-hover:bg-white/20 group-hover:text-white"
            }`}>
              <FiMail size={13} />
            </div>
            <span className="truncate">
              <TranslatedText text="Contact" arText="اتصل بنا" enText="Contact Us" esText="Contacto" deText="Kontakt" />
            </span>
          </Link>

        </nav>

        {/* Lien Google Maps Settat */}
        <a 
          href="https://maps.google.com/?q=Plaza+D+Oliviers+Settat" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 bg-[#2C3E2D]/5 hover:bg-[#2C3E2D]/10 rounded-2xl border border-[#2C3E2D]/10 space-y-0.5 text-center block transition group cursor-pointer shadow-2xs"
        >
          <p className="text-[10px] font-bold text-[#2C3E2D] group-hover:scale-105 transition transform">
            📍 Settat
          </p>
          <p className="text-[9px] text-stone-600 font-light leading-relaxed underline decoration-[#C5A059]/60">
            <TranslatedText 
              text="Voir sur Google Maps" 
              arText="عرض على خرائط جوجل" 
              enText="View on Google Maps" 
              esText="Ver en Google Maps" 
              deText="Auf Google Maps anzeigen" 
            />
          </p>
        </a>

      </div>
    </aside>
  );
}