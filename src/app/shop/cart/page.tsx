
"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import Price from "@/components/Price"; 
import TranslatedText from "@/components/TranslatedText";
import { useLanguage } from "@/context/LanguageContext";
import { 
  FiShoppingBag, 
  FiTrash2, 
  FiPlus, 
  FiMinus, 
  FiArrowRight, 
  FiArrowLeft,
  FiAlertCircle
} from "react-icons/fi";

export default function CartPage() {
  const { items: cart, removeItem, updateQuantity, clearCart, getTotalPrice, hasHydrated } = useCartStore();
  const { language } = useLanguage() as { language: string };
  const isAr = (language || "fr").toLowerCase() === "ar";

  const totalPrice = getTotalPrice();

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#F8FAF6] py-16 text-center text-stone-500 font-bold text-sm">
        <TranslatedText text="Chargement de votre panier..." arText="جاري تحميل سلة التسوق..." />
      </div>
    );
  }

  const arrowIconClass = isAr ? <FiArrowLeft /> : <FiArrowRight />;
  const backIconClass = isAr ? <FiArrowRight /> : <FiArrowLeft />;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#F8FAF6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation retour vers la boutique */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-emerald-600 transition font-medium"
        >
          {backIconClass} <TranslatedText text="Continuer vos achats" arText="متابعة التسوق" />
        </Link>

        <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-3">
          <FiShoppingBag className="text-emerald-600" /> 
          <TranslatedText text="Mon Panier" arText="سلة التسوق" />
        </h1>

        {cart.length === 0 ? (
          /* PANIER VIDE */
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <FiShoppingBag size={36} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-1">
                <TranslatedText text="Votre panier est vide" arText="سلة التسوق فارغة" />
              </h2>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                <TranslatedText 
                  text="Découvrez nos produits du terroir et ajoutez vos articles préférés." 
                  arText="اكتشف منتجاتنا المحلية وأضف منتجاتك المفضلة." 
                />
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-sm"
            >
              <TranslatedText text="Explorer la boutique" arText="استكشف المتجر" /> {arrowIconClass}
            </Link>
          </div>
        ) : (
          /* LISTE DES ARTICLES EN PANIER */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  {cart.length} <TranslatedText text="article(s) dans le panier" arText="منتج (منتجات) في السلة" />
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <FiTrash2 /> <TranslatedText text="Vider le panier" arText="إفراغ السلة" />
                </button>
              </div>

              {cart.map((item) => {
                const isAtMaxStock = item.quantity >= item.stock;

                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Visuel & Nom */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name_fr} className="w-full h-full object-cover" />
                          ) : (
                            <span>🌿</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                            <TranslatedText text={item.name_fr} arText={item.name_ar} />
                          </h3>
                          <p className="text-xs font-extrabold text-emerald-600 mt-1 flex items-center gap-1">
                            <Price amountInMAD={item.price} /> 
                            <span className="text-[10px] text-stone-400 font-normal">
                              <TranslatedText text="l'unité" arText="للوحدة" />
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Boutons Quantité */}
                      <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isAtMaxStock}
                          title={isAtMaxStock ? "Stock maximal atteint" : "Ajouter un"}
                          className={`w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-stone-700 transition ${
                            isAtMaxStock ? "opacity-40 cursor-not-allowed" : "hover:bg-stone-200 cursor-pointer"
                          }`}
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>

                      {/* Suppression */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-red-500 p-2 transition cursor-pointer"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    {/* Alerte si stock limite atteint */}
                    {isAtMaxStock && (
                      <div className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                        <FiAlertCircle size={14} className="shrink-0" />
                        <span>
                          <TranslatedText 
                            text={`Stock maximal atteint pour cet article (${item.stock} disponibles).`} 
                            arText={`تم بلوغ الحد الأقصى للمخزون لهذا المنتج (${item.stock} متوفرة).`} 
                          />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RÉCAPITULATIF FINANCIER */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs h-fit space-y-4 sticky top-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-800 border-b border-stone-100 pb-3">
                <TranslatedText text="Récapitulatif" arText="ملخص الطلب" />
              </h2>

              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex justify-between items-center">
                  <span><TranslatedText text="Sous-total :" arText="المجموع الفرعي:" /></span>
                  <span className="font-bold text-stone-900">
                    <Price amountInMAD={totalPrice} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span><TranslatedText text="Livraison au Maroc :" arText="التوصيل في المغرب:" /></span>
                  <span className="text-stone-400 italic">
                    <TranslatedText text="Calculé au checkout" arText="يحسب عند الدفع" />
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-4">
                <div className="flex justify-between items-center text-base font-extrabold text-stone-900">
                  <span><TranslatedText text="Total :" arText="المجموع:" /></span>
                  <span className="text-emerald-600">
                    <Price amountInMAD={totalPrice} />
                  </span>
                </div>

                <Link
                  href="/shop/checkout"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <TranslatedText text="Commander" arText="إتمام الطلب" /> {arrowIconClass}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
