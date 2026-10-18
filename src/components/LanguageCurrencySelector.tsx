"use client";

import { useLanguage, Language, Currency } from "@/context/LanguageContext";
import { FiGlobe, FiDollarSign } from "react-icons/fi";

export default function LanguageCurrencySelector() {
  const { language, setLanguage, currency, setCurrency } = useLanguage() as any;

  return (
    <div className="flex items-center gap-2 bg-[#FAF9F5] border border-stone-200 rounded-2xl px-3 py-1.5 text-xs shadow-sm">
      {/* Sélecteur de Langue (Vos 5 langues intactes) */}
      <div className="flex items-center gap-1">
        <FiGlobe className="text-[#2C3E2D]" size={13} />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
        >
          <option value="fr">FR 🇫🇷</option>
          <option value="ar">العربية 🇲🇦</option>
          <option value="en">EN 🇬🇧</option>
          <option value="es">ES 🇪🇸</option>
          <option value="de">DE 🇩🇪</option>
        </select>
      </div>

      <span className="text-stone-300">|</span>

      {/* Sélecteur de Devise (Relié à setCurrency) */}
      <div className="flex items-center gap-1">
        <FiDollarSign className="text-[#2C3E2D]" size={13} />
        <select
          value={currency || "MAD"}
          onChange={(e) => setCurrency && setCurrency(e.target.value as Currency)}
          className="bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
        >
          <option value="MAD">MAD</option>
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>
    </div>
  );
}