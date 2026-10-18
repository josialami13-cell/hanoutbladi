
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TranslatedText from "@/components/TranslatedText";
import GlobalBanners from "@/components/GlobalBanners";
import { FiArrowRight, FiChevronUp, FiGrid } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

interface Department {
  id: string;
  name_fr: string;
  name_ar?: string;
  slug: string;
  image?: string;
}

export default function HomePage() {
  const { language } = useLanguage() as { language: string };
  const isAr = language === "ar";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    void fetchDepartments();

    const handleScroll = () => setShowScrollTop(window.scrollY > 360);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      setDepartments(Array.isArray(data) ? (data as Department[]) : []);
    } catch (error) {
      console.error("Erreur lors du chargement des départements :", error);
      setDepartments([]);
    } finally {
      setLoadingDepts(false);
    }
  };

  const getDepartmentImage = (department: Department): string => {
    if (department.image?.trim()) return department.image;
    const slug = department.slug.toLowerCase();

    if (slug.includes("cosmetique") || slug.includes("soin") || slug.includes("beaute")) return "/images/cosmetiques.jpg";
    if (slug.includes("plante") || slug.includes("tisane") || slug.includes("infusion")) return "/images/tisanes.jpg";
    if (slug.includes("epice") || slug.includes("condiment")) return "/images/epices.jpg";
    if (slug.includes("poterie") || slug.includes("artisanat") || slug.includes("ceramique")) return "/images/poterie.jpg";
    if (slug.includes("huile") || slug.includes("olive") || slug.includes("arahma")) return "/images/huile.jpg";
    if (slug.includes("miel") || slug.includes("amlou")) return "/images/miel.jpg";
    
    return "/images/food.jpg";
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const arrowClass = isAr ? "rotate-180" : "";
  const count = departments.length;

  // Grille flexible (Max 3 par ligne sur grand écran, parfaitement remplie)
  const gridColsClass =
    count <= 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : count === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  // Images agrandies et bien visibles pour occuper l'espace
  const cardHeightClass = "h-[180px] sm:h-[220px] lg:h-[260px]";

  return (
    <main
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex w-full flex-col overflow-x-hidden bg-[#faf9f5] font-sans text-stone-800 pb-8"
    >
      {/* 1. Bannière défilante des produits */}
      <GlobalBanners />

      {/* 2. Matrice des départements occupant tout le champ visuel */}
      <div className="w-full flex-1 px-3 sm:px-6 pt-3 max-w-7xl mx-auto">
        <section className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#98783b]">
              <FiGrid size={15} aria-hidden="true" />
              <TranslatedText text="Choisissez votre univers" arText="اختروا قسمكم المفضل" />
            </span>
          </div>

          {loadingDepts ? (
            <div className={`grid ${gridColsClass} gap-3 sm:gap-5`}>
              {[1, 2, 3].map((item) => (
                <div key={item} className={`${cardHeightClass} animate-pulse rounded-2xl bg-stone-200`} />
              ))}
            </div>
          ) : departments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-xs sm:text-sm text-stone-500">
              <TranslatedText text="Aucun département trouvé pour le moment." arText="لم يتم العثور على أي قسم حالياً." />
            </div>
          ) : (
            <div className={`grid ${gridColsClass} gap-3 sm:gap-5`}>
              {departments.map((department) => (
                <Link
                  key={department.id}
                  href={`/shop?department=${department.slug}`}
                  className={`group relative flex ${cardHeightClass} w-full overflow-hidden rounded-2xl border border-stone-200/80 shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <img
                    src={getDepartmentImage(department)}
                    alt={department.name_fr}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  
                  {/* Ombrage pour la lisibilité du texte */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#142017]/90 via-[#142017]/30 to-transparent" />
                  
                  {/* Contenu bas de carte */}
                  <div className="relative mt-auto w-full p-4 sm:p-5">
                    <h3 className="line-clamp-1 font-serif text-base sm:text-xl font-bold text-white leading-tight">
                      <TranslatedText text={department.name_fr} arText={department.name_ar} />
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#A2D95B]">
                      <TranslatedText text="Découvrir" arText="اكتشف" />
                      <FiArrowRight size={14} className={`transition-transform group-hover:translate-x-1.5 ${arrowClass}`} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bouton retour en haut */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-16 end-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#1e2d20] text-white shadow-lg transition hover:bg-[#2c3e2d] cursor-pointer"
        >
          <FiChevronUp size={18} aria-hidden="true" />
        </button>
      )}
    </main>
  );
}