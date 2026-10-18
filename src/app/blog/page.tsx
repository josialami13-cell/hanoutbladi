"use client";

import { useState } from "react";
import Link from "next/link";
import { FiSearch, FiCalendar, FiArrowRight } from "react-icons/fi";
import TranslatedText from "@/components/TranslatedText";

interface Article {
  id: string;
  title_fr: string;
  title_ar?: string | null;
  slug: string;
  excerpt_fr: string;
  excerpt_ar?: string | null;
  category: string;
  date: string;
  image: string;
}

const mockArticles: Article[] = [
  {
    id: "1",
    title_fr: "Les bienfaits de l'huile d'olive extra-vierge de nos terres de Settat",
    title_ar: "فوائد زيت الزيتون البكر الممتاز من أراضينا في سطات",
    slug: "bienfaits-huile-olive-settat",
    excerpt_fr: "Découvrez pourquoi notre huile d'olive est reconnue pour sa pureté exceptionnelle et ses vertus pour la santé.",
    excerpt_ar: "اكتشف لماذا تشتهر زيت الزيتون الخاصة بنا بنقائها الاستثنائي وفوائدها الصحية.",
    category: "Terroir & Santé",
    date: "12 Sept 2026",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    title_fr: "L'art du miel pur : du rucher à votre table",
    title_ar: "فن العسل النقي: من الخلايا إلى مائدتك",
    slug: "art-du-miel-pur",
    excerpt_fr: "Une immersion au cœur de nos apiculteurs partenaires pour comprendre la récolte traditionnelle du miel de fleurs.",
    excerpt_ar: "غوص في قلب النحالين الشركاء لفهم حصاد العسل التقليدي.",
    category: "Traditions",
    date: "05 Sept 2026",
    image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "3",
    title_fr: "Cuisine marocaine : sublimer les agrumes et les épices",
    title_ar: "المطبخ المغربي: ابتكار أطباق بالحامض والتوابل الأصيلة",
    slug: "cuisine-marocaine-epices",
    excerpt_fr: "Conseils et astuces de grand-mère pour préparer les meilleurs tajines de notre terroir.",
    excerpt_ar: "نصائح وحيل الجدة لتحضير أفضل طواجن من أراضينا.",
    category: "Gastronomie",
    date: "28 Août 2026",
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80"
  }
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = mockArticles.filter((article) => {
    const matchesSearch = 
      !searchQuery ||
      article.title_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt_fr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#2C3E2D] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* --- EN-TÊTE DU BLOG --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              <span className="text-[#C5A059]">Hanout Bladi</span> — <TranslatedText text="Le Blog" arText="المدونة" />
            </h1>
            <p className="text-xs text-stone-500 mt-0.5 font-light">
              <TranslatedText text="Histoires, traditions, recettes et secrets de notre terroir" arText="قصص، تقاليد، وصفات وأسرار أراضينا" />
            </p>
          </div>

          {/* Recherche dans le blog */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
            <input 
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C5A059] shadow-2xs"
            />
          </div>
        </div>

        {/* --- GRILLE DES ARTICLES --- */}
        <div>
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-2 text-xs">
              <p className="text-stone-500"><TranslatedText text="Aucun article trouvé." arText="لم يتم العثور على مقالات." /></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article 
                  key={article.id} 
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-[#C5A059] hover:shadow-md transition group"
                >
                  <div>
                    {/* Image de l'article */}
                    <div className="block relative aspect-[16/9] bg-stone-100 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title_fr} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-stone-800 text-[10px] font-semibold px-3 py-1 rounded-full shadow-2xs border border-stone-100">
                        {article.category}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-stone-400">
                        <FiCalendar size={13} /> <span>{article.date}</span>
                      </div>
                      <h2 className="font-serif font-bold text-stone-900 text-base line-clamp-2 group-hover:text-[#C5A059] transition">
                        <TranslatedText text={article.title_fr} arText={article.title_ar} />
                      </h2>
                      <p className="text-xs text-stone-600 line-clamp-2 font-light leading-relaxed">
                        <TranslatedText text={article.excerpt_fr} arText={article.excerpt_ar} />
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link 
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C3E2D] hover:text-[#C5A059] transition cursor-pointer"
                    >
                      <TranslatedText text="Lire l'article" arText="اقرأ المقال" /> <FiArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}