"use client";

import TranslatedText from "@/components/TranslatedText";
import { FiClock } from "react-icons/fi";

export default function BlogPage() {
  return (
    <div className="bg-[#FAF9F5] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#2C3E2D] selection:text-white">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-2xl border border-stone-200/90 shadow-2xs">
        
        {/* Icône */}
        <div className="w-16 h-16 mx-auto bg-[#FAF9F5] border border-stone-200 rounded-full flex items-center justify-center text-[#C5A059]">
          <FiClock size={28} />
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            <TranslatedText text="Coming Soon" arText="قريباً" />
          </h1>
          <p className="text-xs text-stone-500 font-light leading-relaxed">
            <TranslatedText 
              text="Notre blog arrive très bientôt. Restez connectés pour découvrir nos histoires, recettes et secrets du terroir." 
              arText="مدونتنا ستطلق قريباً جداً. ترقبوا اكتشاف قصصنا، وصفاتنا وأسرار أراضينا." 
            />
          </p>
        </div>

        {/* Bouton retour / accueil */}
        <div className="pt-2">
          <a
            href="/"
            className="inline-block w-full py-3 px-4 bg-[#2C3E2D] hover:bg-[#1e2a1f] text-white text-xs font-medium rounded-xl transition shadow-2xs text-center"
          >
            <TranslatedText text="Retour à l'accueil" arText="العودة إلى الرئيسية" />
          </a>
        </div>

      </div>
    </div>
  );
}