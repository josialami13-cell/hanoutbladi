
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
  id: string;
  name_fr?: string;
  name_ar?: string;
  name_en?: string;
  name_es?: string;
  name_de?: string;
  description_fr?: string;
  description_ar?: string;
  description_en?: string;
  description_es?: string;
  description_de?: string;
  price: number;
  stock?: number;
  unit?: string;
  images?: string[];
}

export default function GlobalBanners() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { language } = useLanguage() as { language: string };
  const currentLang = (language || "fr").toLowerCase();
  const isAr = currentLang === "ar";

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      })
      .catch((err) => console.error("Erreur chargement produits:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuantityChange = (productId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const getLocalizedText = (product: Product, field: "name" | "description") => {
    if (field === "name") {
      let rawName = "";
      if (currentLang === "ar" && product.name_ar) rawName = product.name_ar;
      else if (currentLang === "en" && product.name_en) rawName = product.name_en;
      else if (currentLang === "es" && product.name_es) rawName = product.name_es;
      else if (currentLang === "de" && product.name_de) rawName = product.name_de;
      else rawName = product.name_fr || product.name_en || "Produit";

      return rawName
        .replace(/^Bidon\s+/i, "")
        .replace(/^Bouteille\s+/i, "")
        .trim();
    } else {
      if (currentLang === "ar" && product.description_ar) return product.description_ar;
      if (currentLang === "en" && product.description_en) return product.description_en;
      if (currentLang === "es" && product.description_es) return product.description_es;
      if (currentLang === "de" && product.description_de) return product.description_de;
      return product.description_fr || product.description_en || product.unit || "";
    }
  };

  const getAddedToastMessage = (productName: string, qty: number) => {
    switch (currentLang) {
      case "ar": return `تمت إضافة ${qty} من "${productName}" إلى السلة`;
      case "en": return `${qty} x "${productName}" added to cart!`;
      case "es": return `¡${qty} x "${productName}" añadido al carrito!`;
      case "de": return `${qty} x "${productName}" zum Warenkorb hinzugefügt!`;
      default: return `${qty} x "${productName}" ajouté au panier !`;
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const qty = quantities[product.id] || 1;
    const displayName = getLocalizedText(product, "name");
    const image = product.images?.[0] || "/placeholder.jpg";

    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name_fr: product.name_fr || displayName,
        name_ar: product.name_ar || undefined,
        price: product.price,
        image,
        stock: product.stock || 10,
      });
    }

    toast.success(getAddedToastMessage(displayName, qty));
  };

  if (loading) {
    return <div className="w-full h-20 bg-stone-100 animate-pulse rounded-2xl my-2" />;
  }

  if (products.length === 0) return null;

  return (
    <div className="w-full my-3" dir={isAr ? "rtl" : "ltr"}>
      {/* Carrousel horizontal compact et fluide avec plusieurs cartes côte à côte */}
      
        <div className="flex gap-3 overflow-x-auto scrollbar-none py-1 px-1 snap-x snap-mandatory">
          {products.map((product) => {
            const qty = quantities[product.id] || 1;
            const imgUrl = product.images?.[0] || "/placeholder.jpg";
            const displayName = getLocalizedText(product, "name");
            const displayDesc = getLocalizedText(product, "description");

            return (
              <div
                key={product.id}
                onClick={() => router.push(`/shop/${product.id}`)}
                className="flex-none w-[240px] sm:w-[260px] flex items-center justify-between gap-2.5 bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs hover:border-emerald-700 transition cursor-pointer snap-start"
              >
                {/* Image nette et proportionnée */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FAF9F5] rounded-lg flex-shrink-0 overflow-hidden border border-stone-100 flex items-center justify-center p-1">
                  <img
                    src={imgUrl}
                    alt={displayName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Nom et prix du produit */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate leading-tight">
                    {displayName}
                  </h4>
                  {displayDesc && (
                    <p className="text-[10px] text-stone-500 truncate mt-0.5">
                      {displayDesc}
                    </p>
                  )}
                  <p className="text-xs font-extrabold text-emerald-800 mt-1">
                    {product.price} <span className="text-[9px] font-normal text-stone-400">MAD</span>
                  </p>
                </div>

                {/* Contrôle de quantité et bouton d'ajout */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1 bg-stone-100 text-stone-900 px-1 py-0.5 rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={(e) => handleQuantityChange(product.id, -1, e)}
                      className="w-4 h-4 bg-white text-stone-700 rounded flex items-center justify-center font-bold text-[10px] shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <FiMinus size={9} />
                    </button>
                    <span className="text-[11px] font-extrabold px-1 text-emerald-900">{qty}</span>
                    <button
                      type="button"
                      onClick={(e) => handleQuantityChange(product.id, 1, e)}
                      className="w-4 h-4 bg-[#2C3E2D] text-white rounded flex items-center justify-center font-bold text-[10px] shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <FiPlus size={9} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full bg-[#2C3E2D] hover:bg-[#1f2b20] text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition active:scale-95 shadow-xs cursor-pointer"
                    title={isAr ? "أضف إلى السلة" : "Ajouter au panier"}
                  >
                    <FiShoppingBag size={10} />
                    <span>{isAr ? "إضافة" : "Ajouter"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    
  );
}
