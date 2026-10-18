"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiGift, FiPlus, FiPackage } from "react-icons/fi";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { useLanguage } from "@/context/LanguageContext";
import Price from "@/components/Price";

interface Bundle {
  id: string; name_fr: string; name_ar?: string | null; description_fr?: string | null; discountPercent: number;
  items: Array<{ quantity: number; product: { id: string; name_fr: string; name_ar?: string | null; price: number; stock: number; images: string[] } }>;
}

export default function BundleShowcase() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage() as { language: string };
  const isAr = language === "ar";
  const addItem = useCartStore((state) => state.addItem);
  const currentItems = useCartStore((state) => state.items);

  useEffect(() => {
    fetch("/api/bundles").then((res) => res.ok ? res.json() : []).then((data) => setBundles(Array.isArray(data) ? data : [])).catch(() => setBundles([])).finally(() => setLoading(false));
  }, []);

  const addBundle = (bundle: Bundle) => {
    const enoughStock = bundle.items.every(({ product, quantity }) => {
      const inCart = currentItems.find((item) => item.id === product.id)?.quantity || 0;
      return product.stock >= quantity + inCart;
    });
    if (!enoughStock) { toast.error(isAr ? "الكمية المتوفرة غير كافية لإضافة هذه الباقة." : "Stock insuffisant pour ajouter tous les articles du pack."); return; }
    bundle.items.forEach(({ product, quantity }) => addItem({
      id: product.id,
      name_fr: product.name_fr,
      name_ar: product.name_ar || undefined,
      price: product.price,
      image: product.images?.[0] || "/images/huile1l.jpg",
      stock: product.stock,
    }, quantity));
    toast.success(isAr ? `تمت إضافة باقة ${bundle.name_ar || bundle.name_fr} إلى السلة.` : `Pack « ${bundle.name_fr} » ajouté au panier.`);
  };

  if (loading || bundles.length === 0) return null;
  return (
    <section className="space-y-4" aria-labelledby="bundles-heading">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b7939]"><FiGift /> {isAr ? "عروض مختارة" : "Offres à découvrir"}</p>
          <h2 id="bundles-heading" className="mt-1 font-serif text-2xl font-bold text-stone-900">{isAr ? "باقات من منتجاتنا" : "Nos packs du terroir"}</h2>
        </div>
        <span className="hidden rounded-full bg-[#f4edda] px-3 py-1.5 text-xs font-bold text-[#80652f] sm:inline-flex">{isAr ? "تخفيض عند شراء الباقة" : "Remise appliquée au panier"}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {bundles.map((bundle) => {
          const subtotal = bundle.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
          const price = Math.max(0, subtotal * (1 - bundle.discountPercent / 100));
          const cover = bundle.items[0]?.product.images?.[0] || "/images/huile1l.jpg";
          return (
            <article key={bundle.id} className="overflow-hidden rounded-3xl border border-[#dfd6bd] bg-white shadow-sm sm:flex">
              <div className="relative h-40 shrink-0 bg-[#f1eee5] sm:h-auto sm:w-36">
                <Image src={cover} alt={bundle.name_fr} fill sizes="160px" className="object-cover" />
                <span className="absolute start-3 top-3 rounded-full bg-[#2c3e2d] px-2.5 py-1 text-[10px] font-bold text-white">-{bundle.discountPercent}%</span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">{isAr && bundle.name_ar ? bundle.name_ar : bundle.name_fr}</h3>
                {bundle.description_fr && <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{bundle.description_fr}</p>}
                <ul className="mt-3 space-y-1 text-xs text-stone-600">
                  {bundle.items.map(({ product, quantity }) => <li key={product.id} className="flex items-center gap-1.5"><FiPackage className="shrink-0 text-[#9b7939]" />{isAr && product.name_ar ? product.name_ar : product.name_fr} × {quantity}</li>)}
                </ul>
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <div><p className="text-[10px] text-stone-400 line-through"><Price amountInMAD={subtotal} /></p><p className="font-extrabold text-[#2c3e2d]"><Price amountInMAD={price} /></p></div>
                  <button type="button" onClick={() => addBundle(bundle)} className="inline-flex items-center gap-2 rounded-xl bg-[#2c3e2d] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#1e2d20]"><FiPlus />{isAr ? "أضف الباقة" : "Ajouter le pack"}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
