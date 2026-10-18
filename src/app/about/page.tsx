"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import TranslatedText from "@/components/TranslatedText";

export default function AboutPage() {
  return (
    <div className="bg-[#FAF9F5] min-h-screen selection:bg-[#2C3E2D] selection:text-white">
      
      {/* SECTION HERO AVEC LA VRAIE PHOTO BIEN VISIBLE */}
      <div className="relative bg-stone-900 text-white py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Image de fond avec opacité augmentée (plus claire) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/ferme-plaza.jpg" 
            alt="Domaine Plaza D'Oliviers Settat" 
            className="w-full h-full object-cover opacity-75 scale-105 transform transition duration-1000"
          />
          {/* Voile assombrissant très léger juste pour le confort de lecture du texte */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Contenu de l'en-tête */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059] bg-stone-900/60 border border-[#C5A059]/40 px-4 py-1.5 rounded-full backdrop-blur-xs">
            Domaine Plaza D'Oliviers • Mzamza Janoubia, Settat
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide drop-shadow-md">
            <TranslatedText text="Notre Histoire & Notre Passion du Terroir" arText="قصتنا وشغفنا بالأصالة" />
          </h1>
          <p className="text-sm sm:text-base text-stone-100 max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
            Niché au cœur de notre oliveraie de 60 hectares, le domaine <strong>Plaza D'Oliviers</strong> et notre boutique <strong>Hanout Bladi</strong> incarnent l'authenticité des traditions marocaines et le respect de la terre.
          </p>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Grille de présentation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#2C3E2D]">
              <TranslatedText text="Des huiles d'olive d'exception" arText="زيوت زيتون استثنائية" />
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Sur notre domaine, nous cultivons avec soin des variétés d'olives nobles du terroir marocain telles que la <strong>Picholine</strong>, la <strong>Menara</strong> et la <strong>Débia</strong>. Nos olives sont récoltées à maturité pour vous garantir une huile d'olive vierge extra d'une qualité incomparable.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#2C3E2D]">
              <TranslatedText text="Le goût authentique du terroir" arText="المذاق الأصيل للمنتجات المحلية" />
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Au-delà de notre production, Hanout Bladi vous propose une sélection rigoureuse de produits locaux : table d'olives traditionnelles, miel pur de fleurs, et notre fameux amlou artisanal préparé selon la recette ancestrale.
            </p>
          </div>
        </div>

        {/* Section Valeurs & Localisation */}
        <div className="bg-[#2C3E2D] text-white p-8 sm:p-12 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-center shadow-lg">
          <div className="space-y-2">
            <span className="text-3xl font-serif font-black text-[#C5A059]">60 ha</span>
            <h4 className="font-bold text-sm">Domaine Naturel</h4>
            <p className="text-xs text-stone-300 font-light">Une oliveraie vaste et paisible située à Mzamza Janoubia, Settat.</p>
          </div>
          <div className="space-y-2">
            <span className="text-3xl font-serif font-black text-[#C5A059]">Artisanal</span>
            <h4 className="font-bold text-sm">Circuit Court</h4>
            <p className="text-xs text-stone-300 font-light">De notre domaine et nos coopératives partenaires directement chez vous ou en retrait sur place.</p>
          </div>
          <div className="space-y-2">
            <span className="text-3xl font-serif font-black text-[#C5A059]">4+</span>
            <h4 className="font-bold text-sm">Variétés d'Olives</h4>
            <p className="text-xs text-stone-300 font-light">Picholine, Menara, Débia et produits de la ruche.</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#2C3E2D] hover:bg-[#1a261c] text-white px-8 py-4 rounded-2xl font-bold text-xs transition shadow-md cursor-pointer"
          >
            <span>Découvrir notre boutique</span> <FiArrowRight size={16} />
          </Link>
        </div>

      </div>

    </div>
  );
}