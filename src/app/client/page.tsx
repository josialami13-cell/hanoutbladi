// =============================================================
// ESPACE CLIENT - Tableau de bord Hanout Bladi / Plaza D'Oliviers (Compact & Fluide)
// =============================================================

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import TranslatedText from "@/components/TranslatedText";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import { 
  FiShoppingBag, 
  FiAward, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBox, 
  FiArrowRight, 
  FiLogOut, 
  FiGrid,
  FiEdit3,
  FiCreditCard,
  FiX,
  FiGift,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name_fr: string;
    name_ar?: string | null;
    slug: string;
    images?: string[];
    price: number;
  };
}

interface ClientOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscount?: number;
  bundleDiscount?: number;
  status: string;
  paymentMethod: string;
  address: string;
  city: string;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface FavoriteProduct {
  id: string;
  name_fr: string;
  name_ar?: string | null;
  slug: string;
  images?: string[];
  price: number;
}

export default function ClientDashboardPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const { language } = useLanguage() as { language: string };
  const isAr = language === "ar";

  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // État pour suivre quelle commande a ses détails ouverts
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // États pour la modification du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // États pour les préférences (Adresse et Mode de Paiement)
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState("");
  const [defaultCity, setDefaultCity] = useState("Settat");
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState("COD");
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/client/login");
    }
    if (session?.user) {
      setName(session.user.name || "");
      setPhone((session.user as any).phone || "");
      setEmail(session.user.email || "");
      setDefaultAddress((session.user as any).defaultAddress || "");
      setDefaultCity((session.user as any).defaultCity || "Settat");
      setPreferredPaymentMethod((session.user as any).preferredPaymentMethod || "COD");
    }
  }, [status, session, router]);

  const fetchClientData = async () => {
    try {
      const res = await fetch("/api/client/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setFavoriteProducts(Array.isArray(data.favoriteProducts) ? data.favoriteProducts : []);
        setLoyaltyPoints(typeof data.loyaltyPoints === "number" ? data.loyaltyPoints : 0);
      }
    } catch (err) {
      console.error("Erreur chargement données client :", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchClientData();
    }
  }, [status]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(isAr ? "تم تحديث الملف الشخصي بنجاح" : "Profil mis à jour avec succès !");
        await updateSession({ ...session, user: { ...session?.user, name, phone, email } });
        setIsEditingProfile(false);
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPreferences(true);
    try {
      const res = await fetch("/api/client/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultAddress, defaultCity, preferredPaymentMethod }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(isAr ? "تم حفظ التفضيلات بنجاح" : "Préférences enregistrées avec succès !");
        await updateSession({ ...session, user: { ...session?.user, defaultAddress, defaultCity, preferredPaymentMethod } });
        setIsEditingPreferences(false);
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-stone-500 font-medium bg-[#FAF9F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2C3E2D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">
            <TranslatedText text="Chargement de votre espace sécurisé..." arText="جاري تحميل فضاءك الآمن..." />
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const clientName = session?.user?.name || "Client(e)";
  const clientPhone = (session?.user as any)?.phone || (isAr ? "غير متوفر" : "Non renseigné");
  const clientEmail = session?.user?.email;
  const discountValue = (loyaltyPoints / 50).toFixed(2);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">{isAr ? "قيد الانتظار" : "En attente"}</span>;
      case "APPROVED":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[10px] font-bold">{isAr ? "تم الموافقة" : "Approuvée"}</span>;
      case "DELIVERING":
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[10px] font-bold">{isAr ? "قيد التوصيل" : "En livraison"}</span>;
      case "DELIVERED":
      case "PAID":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">{isAr ? "مكتمل" : "Terminée"}</span>;
      case "CANCELLED":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[10px] font-bold">{isAr ? "ملغي" : "Annulée"}</span>;
      default:
        return <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 1. EN-TÊTE DE BIENVENUE */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#2C3E2D]/10 text-[#2C3E2D] rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner">
              {clientName ? clientName.charAt(0).toUpperCase() : <FiUser />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
                {isAr ? `مرحباً، ${clientName} !` : `Bienvenue, ${clientName} !`}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 flex-wrap">
                {clientEmail && (
                  <span className="flex items-center gap-1 bg-stone-50 px-2.5 py-0.5 rounded-md border border-stone-100">
                    <FiMail size={12} className="text-[#2C3E2D]" /> {clientEmail}
                  </span>
                )}
                <span className="flex items-center gap-1 bg-stone-50 px-2.5 py-0.5 rounded-md border border-stone-100">
                  <FiPhone size={12} className="text-[#2C3E2D]" /> {clientPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <Link
              href="/shop"
              className="px-4 py-2.5 bg-[#2C3E2D] hover:bg-[#1f2b20] text-white rounded-xl transition flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <FiGrid size={14} />
              <TranslatedText text="Boutique" arText="المتجر" />
            </Link>

            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <FiEdit3 size={13} />
              <TranslatedText text="Profil" arText="الملف الشخصي" />
            </button>

            <button
              onClick={() => setIsEditingPreferences(true)}
              className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <FiCreditCard size={13} />
              <TranslatedText text="Préférences" arText="التفضيلات" />
            </button>

            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 rounded-xl transition flex items-center justify-center cursor-pointer"
              title="Déconnexion"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>

        {/* 1.5. WIDGET DE FIDÉLITÉ */}
        <div className="bg-gradient-to-r from-[#2C3E2D] to-[#1a251b] text-white p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-extrabold uppercase tracking-widest">
              <FiAward size={16} />
              <TranslatedText text="Programme Fidélité Plaza D'Oliviers" arText="برنامج الولاء بلازا د أوليفييه" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-black">{loyaltyPoints}</h2>
              <span className="text-xs font-semibold text-stone-300">
                <TranslatedText text="Points cumulés" arText="نقطة مكتسبة" />
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              <TranslatedText 
                text={`Valeur indicative : ${discountValue} DH (500 points = 10 DH). Utilisables par blocs de 500 points, dans la limite de 20 % du sous-total.`} 
                arText={`قيمة تقريبية: ${discountValue} درهم (500 نقطة = 10 دراهم). تُستخدم على دفعات 500 نقطة، بحد أقصى 20٪ من المجموع الفرعي.`} 
              />
            </p>
          </div>
        </div>

        {/* 2. LISTE COMPACTE DES COMMANDES RÉCENTES */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <h2 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2 uppercase tracking-wide">
              <FiShoppingBag className="text-[#2C3E2D]" size={16} /> 
              <TranslatedText text="Historique de mes commandes" arText="سجل طلباتي" />
            </h2>
            <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">
              {orders.length} <TranslatedText text="commandes" arText="طلبات" />
            </span>
          </div>

          {isLoadingData ? (
            <div className="py-10 text-center text-stone-400 text-xs">
              <TranslatedText text="Chargement des commandes..." arText="جاري تحميل الطلبات..." />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto text-lg">
                <FiBox />
              </div>
              <p className="text-xs text-stone-500">
                <TranslatedText text="Aucune commande pour le moment." arText="لا توجد طلبات حتى الآن." />
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div key={order.id} className="bg-stone-50/70 border border-stone-200/80 rounded-2xl overflow-hidden transition">
                    
                    {/* Ligne principale compacte */}
                    <div className="p-3 sm:px-4 flex items-center justify-between gap-2 text-xs">
                      
                      {/* Numéro & Date */}
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-stone-900 truncate">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })} • {order.city}
                        </span>
                      </div>

                      {/* Statut */}
                      <div className="shrink-0">
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Montant total */}
                      <div className="font-extrabold text-[#2C3E2D] shrink-0 text-right">
                        {order.totalAmount.toFixed(2)} MAD
                      </div>

                      {/* Bouton pour afficher/masquer les détails des articles */}
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold shrink-0"
                      >
                        <span>{order.items.length} <TranslatedText text="art." arText="منتج" /></span>
                        {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Détails des articles (Accordéon dépliable) */}
                    {isExpanded && (
                      <div className="bg-white px-4 py-3 border-t border-stone-200/60 space-y-2 animate-fadeIn">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          <TranslatedText text="Détails des articles :" arText="تفاصيل المنتجات:" />
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2.5 p-2 bg-[#FAF9F5] rounded-xl border border-stone-100 text-xs">
                              <div className="w-9 h-9 bg-white rounded-lg overflow-hidden shrink-0 border border-stone-200/60 relative">
                                {item.product?.images?.[0] ? (
                                  <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-400">Plaza</div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-stone-900 truncate text-[11px]">
                                  {isAr && item.product?.name_ar ? item.product.name_ar : item.product?.name_fr}
                                </p>
                                <p className="text-[10px] text-stone-500">
                                  {item.quantity} x <span className="font-semibold text-stone-800">{item.price} MAD</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {(Number(order.bundleDiscount || 0) > 0 || Number(order.loyaltyDiscount || 0) > 0) && (
                          <div className="mt-3 space-y-1 rounded-xl bg-emerald-50 p-3 text-xs">
                            {Number(order.bundleDiscount || 0) > 0 && <p className="flex justify-between"><span>Remise pack</span><strong>−{Number(order.bundleDiscount).toFixed(2)} DH</strong></p>}
                            {Number(order.loyaltyDiscount || 0) > 0 && <p className="flex justify-between"><span>{order.loyaltyPointsUsed} points utilisés</span><strong>−{Number(order.loyaltyDiscount).toFixed(2)} DH</strong></p>}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. PRODUITS FAVORIS */}
        {favoriteProducts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2 uppercase tracking-wide">
              <span className="text-[#C5A059]">★</span> 
              <TranslatedText text="Vos produits favoris du terroir" arText="منتجاتك المفضلة من التراث" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {favoriteProducts.map((prod) => (
                <div key={prod.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-stone-100">
                    {prod.images?.[0] ? (
                      <img src={prod.images[0]} alt={prod.name_fr} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">Plaza</div>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden flex-1">
                    <h4 className="font-bold text-stone-900 text-xs truncate">
                      {isAr && prod.name_ar ? prod.name_ar : prod.name_fr}
                    </h4>
                    <p className="text-[11px] font-black text-[#2C3E2D]">{prod.price} MAD</p>
                    <Link href={`/shop/${prod.slug}`} className="text-[10px] text-[#C5A059] hover:underline inline-block font-semibold">
                      <TranslatedText text="Commander à nouveau →" arText="اطلب مجدداً ←" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODALE 1 : PROFIL */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5 relative border border-stone-200">
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 cursor-pointer">
                <FiX size={18} />
              </button>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                <TranslatedText text="Modifier vos informations" arText="تعديل معلوماتك الشخصية" />
              </h3>
              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1"><TranslatedText text="Nom complet" arText="الاسم الكامل" /></label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1"><TranslatedText text="Téléphone" arText="الهاتف" /></label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1"><TranslatedText text="Email" arText="البريد الإلكتروني" /></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 font-bold rounded-xl uppercase tracking-wider cursor-pointer">
                    <TranslatedText text="Annuler" arText="إلغاء" />
                  </button>
                  <button type="submit" disabled={isUpdatingProfile} className="w-1/2 py-3 bg-[#2C3E2D] hover:bg-[#1f2b20] text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer disabled:opacity-50">
                    {isUpdatingProfile ? "..." : <TranslatedText text="Enregistrer" arText="حفظ" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODALE 2 : PRÉFÉRENCES */}
        {isEditingPreferences && (
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5 relative border border-stone-200">
              <button onClick={() => setIsEditingPreferences(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 cursor-pointer">
                <FiX size={18} />
              </button>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                <TranslatedText text="Adresse & Mode de Paiement" arText="العنوان وطريقة الدفع" />
              </h3>
              <form onSubmit={handleSavePreferences} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1"><TranslatedText text="Adresse par défaut" arText="العنوان الافتراضي" /></label>
                  <input type="text" value={defaultAddress} onChange={(e) => setDefaultAddress(e.target.value)} className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1"><TranslatedText text="Ville" arText="المدينة" /></label>
                  <input type="text" value={defaultCity} onChange={(e) => setDefaultCity(e.target.value)} className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1"><TranslatedText text="Paiement favori" arText="الدفع المفضل" /></label>
                  <select value={preferredPaymentMethod} onChange={(e) => setPreferredPaymentMethod(e.target.value)} className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C5A059] cursor-pointer">
                    <option value="COD">Paiement à la livraison</option>
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="CARD">Carte Bancaire</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditingPreferences(false)} className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 font-bold rounded-xl uppercase tracking-wider cursor-pointer">
                    <TranslatedText text="Annuler" arText="إلغاء" />
                  </button>
                  <button type="submit" disabled={isUpdatingPreferences} className="w-1/2 py-3 bg-[#2C3E2D] hover:bg-[#1f2b20] text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer disabled:opacity-50">
                    {isUpdatingPreferences ? "..." : <TranslatedText text="Enregistrer" arText="حفظ" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
