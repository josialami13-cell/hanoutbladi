
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiMinus,
  FiPlus,
  FiSearch,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";
import TranslatedText from "@/components/TranslatedText";
import Price from "@/components/Price";
import { useCartStore } from "@/store/cart";
import { useLanguage } from "@/context/LanguageContext";

interface Category {
  id: string;
  name_fr: string;
  name_ar?: string;
  name_en?: string;
  name_es?: string;
  name_de?: string;
  slug: string;
  departmentId?: string;
  department?: {
    slug: string;
    name_fr: string;
    name_ar?: string;
    name_en?: string;
    name_es?: string;
    name_de?: string;
  };
}

interface Product {
  id: string;
  name_fr: string;
  name_ar?: string;
  name_en?: string;
  name_es?: string;
  name_de?: string;
  description_fr?: string;
  description_ar?: string;
  description_en?: string;
  description_es?: string;
  description_de?: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  category?: Category;
}

interface Department {
  id: string;
  name_fr: string;
  name_ar?: string;
  name_en?: string;
  name_es?: string;
  name_de?: string;
  slug: string;
}

const ITEMS_PER_PAGE = 12;
const FALLBACK_IMAGE = "/images/huile1l.jpg";

const normalizeSearch = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

// Helper pour extraire le nom traduit depuis l'objet BDD avec fallback sur FR
function getTranslatedName(
  item: { name_fr: string; name_ar?: string; name_en?: string; name_es?: string; name_de?: string } | undefined,
  lang: string
): string {
  if (!item) return "";
  switch (lang) {
    case "ar":
      return item.name_ar || item.name_fr;
    case "en":
      return item.name_en || item.name_fr;
    case "es":
      return item.name_es || item.name_fr;
    case "de":
      return item.name_de || item.name_fr;
    default:
      return item.name_fr;
  }
}

// Helper pour extraire la description traduite depuis l'objet BDD avec fallback sur FR
function getTranslatedDescription(
  item: { description_fr?: string; description_ar?: string; description_en?: string; description_es?: string; description_de?: string } | undefined,
  lang: string
): string {
  if (!item) return "";
  switch (lang) {
    case "ar":
      return item.description_ar || item.description_fr || "";
    case "en":
      return item.description_en || item.description_fr || "";
    case "es":
      return item.description_es || item.description_fr || "";
    case "de":
      return item.description_de || item.description_fr || "";
    default:
      return item.description_fr || "";
  }
}

const SORT_OPTIONS: Record<
  string,
  {
    titleAsc: string;
    titleDesc: string;
    priceAsc: string;
    priceDesc: string;
    allDepts: string;
    allCats: string;
    searchPlaceholder: string;
  }
> = {
  fr: {
    titleAsc: "Nom : A - Z",
    titleDesc: "Nom : Z - A",
    priceAsc: "Prix : croissant",
    priceDesc: "Prix : décroissant",
    allDepts: "Tous les rayons",
    allCats: "Toutes les catégories",
    searchPlaceholder: "Rechercher...",
  },
  ar: {
    titleAsc: "الاسم: أ - ي",
    titleDesc: "الاسم: ي - أ",
    priceAsc: "السعر: من الأقل للأعلى",
    priceDesc: "السعر: من الأعلى للأقل",
    allDepts: "كل الأقسام",
    allCats: "كل الفئات",
    searchPlaceholder: "ابحثوا عن منتج...",
  },
  en: {
    titleAsc: "Name: A - Z",
    titleDesc: "Name: Z - A",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    allDepts: "All departments",
    allCats: "All categories",
    searchPlaceholder: "Search...",
  },
  es: {
    titleAsc: "Nombre: A - Z",
    titleDesc: "Nombre: Z - A",
    priceAsc: "Precio: Menor a Mayor",
    priceDesc: "Precio: Mayor a Menor",
    allDepts: "Todas las secciones",
    allCats: "Todas las categorías",
    searchPlaceholder: "Buscar...",
  },
  de: {
    titleAsc: "Name: A - Z",
    titleDesc: "Name: Z - A",
    priceAsc: "Preis: aufsteigend",
    priceDesc: "Preis: absteigend",
    allDepts: "Alle Abteilungen",
    allCats: "Alle Kategorien",
    searchPlaceholder: "Suchen...",
  },
};

function ShopPageContent() {
  const searchParams = useSearchParams();
  const departmentFromUrl = searchParams.get("department") || "";
  const { language } = useLanguage() as { language: string };
  const currentLang = language || "fr";
  const isAr = currentLang === "ar";
  const labels = SORT_OPTIONS[currentLang] || SORT_OPTIONS.fr;

  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState(departmentFromUrl);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalMAD = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    setSelectedDepartment(departmentFromUrl);
    setSelectedCategory("");
    setCurrentPage(1);
  }, [departmentFromUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, departmentsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/departments"),
          fetch("/api/categories"),
        ]);

        if (!productsResponse.ok || !departmentsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Erreur lors du chargement des données.");
        }

        const [productsData, departmentsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          departmentsResponse.json(),
          categoriesResponse.json(),
        ]);

        setProducts(Array.isArray(productsData) ? productsData : []);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error("Erreur de chargement :", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const filteredCategories = useMemo(
    () =>
      selectedDepartment
        ? categories.filter((category) => category.department?.slug === selectedDepartment)
        : categories,
    [categories, selectedDepartment],
  );

  const filteredProducts = useMemo(() => {
    const query = normalizeSearch(searchTerm.trim());

    return products
      .filter((product) => {
        const productDepartmentSlug = product.category?.department?.slug;
        const productCategorySlug = product.category?.slug;
        const matchesDepartment = !selectedDepartment || productDepartmentSlug === selectedDepartment;
        const matchesCategory = !selectedCategory || productCategorySlug === selectedCategory;
        const searchableText = [
          product.name_fr,
          product.name_ar,
          product.name_en,
          product.name_es,
          product.name_de,
          product.description_fr,
          product.description_ar,
          product.description_en,
          product.description_es,
          product.description_de,
        ]
          .filter((text): text is string => Boolean(text))
          .map((text) => normalizeSearch(text))
          .join(" ");
        const matchesSearch = !query || searchableText.includes(query);

        return matchesDepartment && matchesCategory && matchesSearch;
      })
      .sort((first, second) => {
        const firstName = getTranslatedName(first, currentLang);
        const secondName = getTranslatedName(second, currentLang);

        if (sortBy === "title-asc") return firstName.localeCompare(secondName, currentLang);
        if (sortBy === "title-desc") return secondName.localeCompare(firstName, currentLang);
        if (sortBy === "price-asc") return first.price - second.price;
        if (sortBy === "price-desc") return second.price - first.price;
        return 0;
      });
  }, [products, searchTerm, selectedDepartment, selectedCategory, sortBy, currentLang]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSelectedDepartment("");
    setSelectedCategory("");
    setSearchTerm("");
    setSortBy("title-asc");
    setCurrentPage(1);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    addItem({
      id: product.id,
      name_fr: product.name_fr,
      name_ar: product.name_ar,
      price: product.price,
      image: product.images?.[0] || FALLBACK_IMAGE,
      stock: product.stock,
      quantity: 1,
    } as any);
  };

  return (
    <main
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-[#faf9f5] font-sans text-stone-800 selection:bg-[#2c3e2d] selection:text-white"
    >
      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-1 items-start gap-4 px-3 py-4 sm:px-5 lg:grid-cols-12 lg:gap-5 lg:px-6 lg:py-5">
        
        {/* Section Produits et Filtres */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {/* Barre de Filtres Multilingue (FR, AR, EN, ES, DE) */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-3 shadow-2xs">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4edda] text-[#8c6e31]">
                  <FiFilter size={14} aria-hidden="true" />
                </span>
                <h2 className="text-xs font-bold text-stone-900">
                  <TranslatedText text="Trouvez votre produit" arText="ابحثوا عن منتجكم" />
                </h2>
              </div>
              {(selectedDepartment || selectedCategory || searchTerm) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-[#80652f] underline underline-offset-2 hover:text-[#2c3e2d] transition"
                >
                  <TranslatedText text="Effacer les filtres" arText="مسح الفلاتر" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 items-end">
              {/* Rayon */}
              <label className="block min-w-0">
                <span className="mb-1 block truncate text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <TranslatedText text="Rayon" arText="القسم" />
                </span>
                <select
                  value={selectedDepartment}
                  onChange={(event) => {
                    setSelectedDepartment(event.target.value);
                    setSelectedCategory("");
                    setCurrentPage(1);
                  }}
                  className="h-9 w-full truncate rounded-lg border border-stone-200 bg-[#faf9f5] px-2.5 text-xs font-medium text-stone-700 outline-none transition focus:border-[#9c7b3c]"
                >
                  <option value="">{labels.allDepts}</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.slug}>
                      {getTranslatedName(department, currentLang)}
                    </option>
                  ))}
                </select>
              </label>

              {/* Catégorie */}
              <label className="block min-w-0">
                <span className="mb-1 block truncate text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <TranslatedText text="Catégorie" arText="الفئة" />
                </span>
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 w-full truncate rounded-lg border border-stone-200 bg-[#faf9f5] px-2.5 text-xs font-medium text-stone-700 outline-none transition focus:border-[#9c7b3c]"
                >
                  <option value="">{labels.allCats}</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {getTranslatedName(category, currentLang)}
                    </option>
                  ))}
                </select>
              </label>

              {/* Trier par */}
              <label className="block min-w-0">
                <span className="mb-1 block truncate text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <TranslatedText text="Trier par" arText="الترتيب حسب" />
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 w-full truncate rounded-lg border border-stone-200 bg-[#faf9f5] px-2.5 text-xs font-medium text-stone-700 outline-none transition focus:border-[#9c7b3c]"
                >
                  <option value="title-asc">{labels.titleAsc}</option>
                  <option value="title-desc">{labels.titleDesc}</option>
                  <option value="price-asc">{labels.priceAsc}</option>
                  <option value="price-desc">{labels.priceDesc}</option>
                </select>
              </label>

              {/* Recherche */}
              <label className="block min-w-0">
                <span className="mb-1 block truncate text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <TranslatedText text="Recherche" arText="البحث" />
                </span>
                <span className="relative block">
                  <FiSearch className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-stone-400" size={13} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder={labels.searchPlaceholder}
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-9 w-full rounded-lg border border-stone-200 bg-[#faf9f5] pe-2.5 ps-8 text-xs font-medium text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-[#9c7b3c]"
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Grille des Produits */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="h-[200px] animate-pulse rounded-2xl bg-stone-200" />
              ))}
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4edda] text-[#8c6e31]">
                <FiSearch size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-serif text-base font-bold text-stone-900">
                <TranslatedText text="Aucun résultat" arText="لا توجد نتائج" />
              </h3>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 rounded-xl bg-[#2c3e2d] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#1e2d20]"
              >
                <TranslatedText text="Réinitialiser" arText="إعادة التعيين" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {currentProducts.map((product) => {
                const imageUrl = product.images?.[0] || FALLBACK_IMAGE;
                const isOutOfStock = product.stock <= 0;
                const productName = getTranslatedName(product, currentLang);
                const productDescription = getTranslatedDescription(product, currentLang);

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xs transition duration-300 hover:shadow-md"
                  >
                    <Link href={`/shop/${product.slug}`} className="relative flex h-36 sm:h-40 w-full items-center justify-center overflow-hidden bg-white p-2">
                      <Image
                        src={imageUrl}
                        alt={productName}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-contain transition duration-500 group-hover:scale-105"
                      />
                      {isOutOfStock && (
                        <span className="absolute end-2 top-2 rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-bold text-red-700 shadow-xs">
                          <TranslatedText text="Épuisé" arText="نفذت" />
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-2.5">
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="line-clamp-2 min-h-7 font-serif text-xs font-bold leading-tight text-stone-900 hover:text-[#9c7b3c] transition">
                          {productName}
                        </h3>
                      </Link>

                      {productDescription && (
                        <p className="mt-1 line-clamp-1 text-[10px] leading-3 text-stone-500">
                          {productDescription}
                        </p>
                      )}

                      <div className="mt-auto flex items-end justify-between gap-1 pt-2">
                        <span className="text-xs font-extrabold text-[#2c3e2d]">
                          <Price amountInMAD={product.price} />
                        </span>
                      </div>

                      <div className="mt-2 border-t border-stone-100 pt-1.5">
                        {isOutOfStock ? (
                          <div className="flex min-h-6 items-center justify-center gap-1 rounded-lg bg-stone-100 px-2 text-[10px] font-semibold text-stone-400">
                            <FiAlertCircle className="text-red-500" size={11} aria-hidden="true" />
                            <TranslatedText text="Rupture" arText="نفذت" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="inline-flex min-h-6 w-full items-center justify-center gap-1 rounded-lg bg-[#2c3e2d] px-2 py-1 text-[11px] font-bold text-white shadow-2xs transition hover:bg-[#1e2d20]"
                          >
                            <FiShoppingBag size={11} aria-hidden="true" />
                            <TranslatedText text="Ajouter" arText="أضف" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
              >
                <FiChevronLeft aria-hidden="true" />
                <TranslatedText text="Précédent" arText="السابق" />
              </button>
              <div className="flex flex-wrap items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                      safeCurrentPage === page
                        ? "bg-[#2c3e2d] text-white shadow-2xs"
                        : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
              >
                <TranslatedText text="Suivant" arText="التالي" />
                <FiChevronRight aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>

        {/* Panier Latéral STICKY */}
        <aside
          className="lg:sticky lg:top-20 lg:col-span-4 xl:col-span-3 h-fit self-start z-30"
          aria-labelledby="cart-heading"
        >
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-md flex flex-col max-h-[calc(100vh-100px)]">
            
            {/* Entête du panier */}
            <div className="border-b border-stone-100 p-3 bg-stone-50/50 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e9efe4] text-[#2c3e2d]">
                    <FiShoppingBag size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="cart-heading" className="font-serif text-sm font-bold text-stone-900">
                      <TranslatedText text="Votre panier" arText="سلتكم" />
                    </h2>
                    <p className="text-[10px] text-stone-500">
                      {cartCount} <TranslatedText text="article(s)" arText="منتج" />
                    </p>
                  </div>
                </div>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f4edda] px-1.5 text-[11px] font-extrabold text-[#80652f]">
                  {cartCount}
                </span>
              </div>

              {cartItems.length > 0 && (
                <div className="pt-2 border-t border-stone-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">
                      <TranslatedText text="Sous-total :" arText="المجموع الفرعي:" />
                    </span>
                    <span className="text-sm font-black text-[#2c3e2d]">
                      <Price amountInMAD={subtotalMAD} />
                    </span>
                  </div>

                  <Link
                    href="/shop/checkout"
                    className="flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#2c3e2d] px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#1e2d20]"
                  >
                    <FiCheckCircle size={13} aria-hidden="true" />
                    <TranslatedText text="Passer la commande" arText="إتمام الطلب" />
                  </Link>
                </div>
              )}
            </div>

            {/* Articles du panier */}
            {cartItems.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf9f5] text-stone-400">
                  <FiShoppingBag size={16} aria-hidden="true" />
                </span>
                <p className="mt-2 text-xs font-semibold text-stone-700">
                  <TranslatedText text="Votre panier est vide" arText="سلتكم فارغة" />
                </p>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-2 overflow-y-auto p-3 min-h-0">
                  {cartItems.map((item) => {
                    const itemImage = item.image || FALLBACK_IMAGE;

                    return (
                      <li key={item.id} className="flex gap-2 rounded-xl border border-stone-100 bg-[#faf9f5] p-2">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-white">
                          <Image
                            src={itemImage}
                            alt={item.name_fr}
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xs font-bold text-stone-800">
                            {getTranslatedName(item, currentLang)}
                          </h3>
                          <p className="mt-0.5 text-[11px] font-extrabold text-[#2c3e2d]">
                            <Price amountInMAD={item.price} />
                          </p>
                          <div className="mt-1 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-5 w-5 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
                            >
                              <FiMinus size={9} />
                            </button>
                            <span className="min-w-4 text-center text-xs font-bold text-stone-700">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-5 w-5 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
                            >
                              <FiPlus size={9} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="ms-auto flex h-5 w-5 items-center justify-center rounded-md text-stone-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <FiTrash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="border-t border-stone-100 p-2.5 bg-stone-50/30 shrink-0 space-y-1.5 text-center">
                  <p className="text-[9.5px] text-stone-400">
                    <TranslatedText text="Frais de livraison calculés à la commande" arText="مصاريف التوصيل تُحسب عند الطلب" />
                  </p>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full rounded-lg py-0.5 text-[10.5px] font-semibold text-stone-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <TranslatedText text="Vider le panier" arText="إفراغ السلة" />
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>

      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#faf9f5]" />}>
      <ShopPageContent />
    </Suspense>
  );
}
