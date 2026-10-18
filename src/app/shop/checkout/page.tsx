// =============================================================
// PAGE DE CHECKOUT - Hanout Bladi / Plaza D'Oliviers (Partie 1/2)
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import TranslatedText from "@/components/TranslatedText";
import Price from "@/components/Price";
import { useLanguage } from "@/context/LanguageContext";
import { calculateBundleDiscount } from "@/lib/bundle-pricing";
import { discountForLoyaltyPoints, maxRedeemablePoints } from "@/lib/loyalty";
import {
  FiArrowLeft,
  FiShoppingBag,
  FiUser,
  FiShield,
  FiDollarSign,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";

const COUNTRIES = [
  { name: "Maroc", code: "+212", flag: "🇲🇦" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Espagne", code: "+34", flag: "🇪🇸" },
  { name: "Belgique", code: "+32", flag: "🇧🇪" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "États-Unis", code: "+1", flag: "🇺🇸" },
  { name: "Italie", code: "+39", flag: "🇮🇹" },
  { name: "Allemagne", code: "+49", flag: "🇩🇪" },
  { name: "Suisse", code: "+41", flag: "🇨🇭" },
  { name: "Algérie", code: "+213", flag: "🇩🇿" },
  { name: "Tunisie", code: "+216", flag: "🇹🇳" },
  { name: "Sénégal", code: "+221", flag: "🇸🇳" },
  { name: "Côte d'Ivoire", code: "+225", flag: "🇨🇮" },
  { name: "Autre pays", code: "", flag: "🌍" },
];

const FALLBACK_IMAGE = "/images/huile1l.jpg";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { language } = useLanguage() as { language: string };
  const isAr = language === "ar";

  const { items: cartItems, clearCart, getTotalPrice, updateQuantity, removeItem } = useCartStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [activeBundles, setActiveBundles] = useState<any[]>([]);

  const isLoggedIn = status === "authenticated" && Boolean(session?.user);
  const isAdmin = isLoggedIn && (session?.user as any)?.role === "ADMIN";

  const sessionPhone = (session?.user as any)?.phone || "";
  const defaultLocalPhone = sessionPhone.startsWith("+212") 
    ? sessionPhone.replace("+212", "") 
    : sessionPhone.replace(/^\+/, "");

  const [selectedCountry, setSelectedCountry] = useState("+212");
  const [localPhone, setLocalPhone] = useState(defaultLocalPhone);

  const [formData, setFormData] = useState({
    customerName: session?.user?.name || "",
    country: "Maroc",
    city: (session?.user as any)?.city || "Settat",
    address: (session?.user as any)?.address || "",
    fulfillmentMode: "delivery",
    shippingMode: "standard",
    paymentMethod: "cash_on_delivery", // 'cash_on_delivery' ou 'bank_transfer'
    notes: "",
    pickupDate: new Date().toISOString().split("T")[0],
    pickupTime: "10:00",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/bundles")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setActiveBundles(Array.isArray(data) ? data : []))
      .catch(() => setActiveBundles([]));
  }, []);

  useEffect(() => {
    if (!isLoggedIn || isAdmin) {
      setLoyaltyBalance(0);
      return;
    }
    fetch("/api/client/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.loyaltyPoints === "number") setLoyaltyBalance(data.loyaltyPoints);
      })
      .catch(() => setLoyaltyBalance(0));
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || session.user.name || "",
        address: prev.address || (session.user as any).address || "",
        city: prev.city || (session.user as any).city || "Settat",
      }));
      const p = (session.user as any).phone;
      if (p && !localPhone) {
        setLocalPhone(p.startsWith("+212") ? p.replace("+212", "") : p);
      }
    }
  }, [session]);

  useEffect(() => {
    if (mounted && cartItems.length === 0) {
      router.replace("/shop");
    }
  }, [mounted, cartItems, router]);

  const getFullPhone = () => {
    const cleanLocal = localPhone.trim().replace(/^0+/, "");
    const cleanCountry = selectedCountry.startsWith("+") ? selectedCountry : `+${selectedCountry}`;
    return `${cleanCountry}${cleanLocal}`;
  };

  // Partage de la position GPS
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        isAr
          ? "خاصية تحديد الموقع غير مدعومة في متصفحك."
          : "La géolocalisation n'est pas supportée par votre navigateur."
      );
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const locationText = `📍 Position GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (${googleMapsUrl})`;

        setFormData((prev) => ({
          ...prev,
          address: prev.address ? `${prev.address}\n${locationText}` : locationText,
        }));

        toast.success(
          isAr
            ? "تمت إضافة موقعك الجغرافي بنجاح!"
            : "Votre position GPS a été ajoutée avec succès !"
        );
        setGettingLocation(false);
      },
      (error) => {
        console.error("Erreur géolocalisation:", error);
        toast.error(
          isAr
            ? "تعذر الحصول على موقعك. يرجى تفعيل GPS."
            : "Impossible de récupérer votre position. Veuillez activer le GPS."
        );
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const subtotal = getTotalPrice();
  const bundleDiscount = calculateBundleDiscount(
    cartItems.map((item: any) => ({
      productId: item.productId || item.id,
      quantity: Number(item.quantity),
      price: Number(item.price),
    })),
    activeBundles as any
  );
  const maxPoints = maxRedeemablePoints(loyaltyBalance, Math.max(0, subtotal - bundleDiscount));
  const effectivePoints = useLoyaltyPoints ? Math.min(pointsToRedeem, maxPoints) : 0;
  const loyaltyDiscount = discountForLoyaltyPoints(effectivePoints);

  const shippingFee =
    formData.fulfillmentMode === "pickup"
      ? 0
      : formData.shippingMode === "express"
      ? 50
      : formData.shippingMode === "amana"
      ? 35
      : 20;

  const grandTotal = Math.max(0, subtotal - bundleDiscount - loyaltyDiscount + shippingFee);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const validateForm = () => {
    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      toast.error(
        isAr
          ? "الرجاء إدخال اسم صحيح (حرفين على الأقل)."
          : "Veuillez entrer un nom valide (minimum 2 caractères)."
      );
      return false;
    }

    if (!localPhone.trim() || localPhone.trim().length < 7) {
      toast.error(
        isAr
          ? "الرجاء إدخال رقم هاتف صحيح."
          : "Veuillez entrer un numéro de téléphone valide."
      );
      return false;
    }

    if (formData.fulfillmentMode === "delivery") {
      if (!formData.country.trim()) {
        toast.error(isAr ? "الرجاء اختيار الدولة." : "Veuillez sélectionner le pays.");
        return false;
      }
      if (!formData.city.trim()) {
        toast.error(isAr ? "الرجاء إدخال المدينة." : "Veuillez renseigner la ville.");
        return false;
      }
      if (!formData.address.trim()) {
        toast.error(
          isAr
            ? "الرجاء إدخال عنوان التوصيل الخاص بك."
            : "Veuillez renseigner votre adresse de livraison."
        );
        return false;
      }
    }

    if (formData.fulfillmentMode === "pickup") {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      if (formData.pickupDate < todayStr) {
        toast.error(
          isAr
            ? "لا يمكن أن يكون تاريخ الاستلام في الماضي."
            : "La date de retrait ne peut pas être dans le passé."
        );
        return false;
      }

      // Vérification de l'heure si retrait aujourd'hui
      if (formData.pickupDate === todayStr) {
        const [hours, minutes] = formData.pickupTime.split(":").map(Number);
        const selectedDateTime = new Date();
        selectedDateTime.setHours(hours, minutes, 0, 0);

        if (selectedDateTime <= now) {
          toast.error(
            isAr
              ? "يرجى اختيار وقت استلام لاحق للوقت الحالي."
              : "Veuillez choisir une heure de retrait ultérieure à l'heure actuelle."
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error(isAr ? "سلة التسوق فارغة." : "Votre panier est vide.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const fullPhone = getFullPhone();

    const uniquePassword = Math.random().toString(36).slice(-8) + "Hb!9";
    const generatedEmail = `${fullPhone.replace(/\+/g, "")}@client.hanoutbladi.ma`;

    try {
      const pickupNotes =
        formData.fulfillmentMode === "pickup"
          ? `[RETRAIT MAGASIN] Prévu le ${formData.pickupDate} à ${formData.pickupTime}`
          : formData.notes;

      const payload = {
        ...formData,
        customerPhone: fullPhone,
        customerEmail: generatedEmail,
        password: uniquePassword,
        address:
          formData.fulfillmentMode === "delivery"
            ? `${formData.address.trim()}, ${formData.city.trim()}, ${formData.country}`
            : "Retrait en magasin - Hanout Bladi",
        city: formData.fulfillmentMode === "delivery" ? formData.city.trim() : "Settat (Magasin)",
        shippingMode: formData.fulfillmentMode === "pickup" ? "onsite" : formData.shippingMode,
        paymentMethod: formData.paymentMethod,
        totalAmount: grandTotal,
        loyaltyPointsToRedeem: effectivePoints,
        shippingFee: shippingFee,
        notes: pickupNotes,
        userId: isLoggedIn ? (session?.user as any)?.id : undefined,
        items: cartItems.map((item: any) => ({
          productId: item.productId || item.id,
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const orderData = await res.json();

        if (!isLoggedIn) {
          await signIn("credentials", {
            redirect: false,
            identifier: fullPhone,
            password: uniquePassword,
          });
        }

        toast.success(
          isAr ? "تم تأكيد الطلب بنجاح!" : "Commande validée avec succès !"
        );

        const paymentLabel =
          formData.paymentMethod === "bank_transfer"
            ? "Virement bancaire"
            : "Paiement à la livraison";

        // 1. Envoi WhatsApp Client
        const clientWhatsAppText =
          `*🌿 Hanout Bladi - Confirmation de commande*\n\n` +
          `Bonjour *${formData.customerName}*,\n` +
          `Votre commande *#${orderData.orderNumber || "N/A"}* a bien été enregistrée !\n\n` +
          `• Total à régler : *${Number(orderData.totalAmount || grandTotal).toFixed(2)} MAD*\n` +
          `• Mode de paiement : *${paymentLabel}*\n\n` +
          `🔐 *Vos accès client (Espace Hanout Bladi) :*\n` +
          `• Identifiant (Téléphone) : ${fullPhone}\n` +
          `• Mot de passe généré : \`${uniquePassword}\`\n\n` +
          `Merci pour votre confiance !`;

        const clientWaUrl = `https://wa.me/${fullPhone.replace(/\+/g, "")}?text=${encodeURIComponent(clientWhatsAppText)}`;
        window.open(clientWaUrl, "_blank");

        // 2. Envoi WhatsApp Admin
        const adminWhatsApp = "212661337729";
        const adminWhatsAppText =
          `*🎉 Nouvelle Commande - Hanout Bladi*\n` +
          `• N° Commande: ${orderData.orderNumber || "N/A"}\n` +
          `• Client: ${formData.customerName}\n` +
          `• Téléphone: ${fullPhone}\n` +
          `• Mode Paiement: ${paymentLabel}\n` +
          `• Mode Récupération: ${formData.fulfillmentMode === "pickup" ? "Retrait Magasin" : "Livraison"}\n` +
          `• Adresse: ${formData.fulfillmentMode === "delivery" ? `${formData.address}, ${formData.city},${formData.country}` : "Retrait Magasin"}\n` +
          `• Total: ${Number(orderData.totalAmount || grandTotal).toFixed(2)} MAD`;

        const adminWaUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(adminWhatsAppText)}`;
        window.open(adminWaUrl, "_blank");

        clearCart();
        router.replace(`/client?order=${orderData.orderNumber}`);
      } else {
        const err = await res.json();
        toast.error(
          err.error || (isAr ? "خطأ أثناء تأكيد الطلب" : "Erreur lors de la validation de la commande")
        );
      }
    } catch (error) {
      console.error("Erreur checkout:", error);
      toast.error(
        isAr ? "خطأ في الخادم، يرجى المحاولة مرة أخرى." : "Erreur serveur, veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  // =============================================================
// PAGE DE CHECKOUT - Hanout Bladi / Plaza D'Oliviers (Partie 2/2)
// =============================================================

  return (
    <main 
      className="min-h-screen relative bg-cover bg-center bg-fixed selection:bg-[#2C3E2D] selection:text-white py-6 px-3 sm:px-6 lg:px-8 flex flex-col"
      style={{ backgroundImage: "url('/images/hero.jpg')" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 bg-[#FAF9F5]/90 backdrop-blur-[2px] pointer-events-none" />

      {/* Conteneur élargi pour un affichage parfait sur les grands écrans */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1550px] mx-auto items-start relative z-10">
        
        {/* Formulaire Principal (Gauche - 8 à 9 Colonnes) */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-4 w-full">
          
          {isAdmin && (
            <div className="bg-amber-50/95 border border-amber-200 py-3 px-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-amber-800 font-bold backdrop-blur-md">
              <FiShield size={18} className="text-amber-600 shrink-0" />
              <span>
                <TranslatedText 
                  text="Mode Administrateur détecté (simulé pour le parcours client)." 
                  arText="تم اكتشاف وضع المسؤول (محاكاة لتجربة العميل)." 
                />
              </span>
            </div>
          )}

          {/* Bouton de retour */}
          <div className="flex items-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl border border-stone-200/90 text-stone-700 hover:bg-stone-50 transition shadow-xs text-xs sm:text-sm font-semibold"
            >
              <FiArrowLeft size={16} />
              <span><TranslatedText text="Retour à la boutique" arText="العودة إلى المتجر" /></span>
            </Link>
          </div>

          <form 
            onSubmit={handleSubmitOrder} 
            onKeyDown={(e) => {
              // Empêche la soumission accidentelle sur la touche Entrée
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                e.preventDefault();
              }
            }}
            className="space-y-4 w-full" 
            noValidate
          >
            
            {/* MODE DE RÉCUPÉRATION */}
            <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-3 w-full">
              <h2 className="text-xs sm:text-sm font-bold text-[#2C3E2D] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-100">
                <FiTruck size={16} /> <TranslatedText text="Mode de Récupération" arText="طريقة الاستلام" />
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fulfillmentMode: "delivery" })}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    formData.fulfillmentMode === "delivery"
                      ? "border-[#2C3E2D] bg-[#2C3E2D]/5 text-[#2C3E2D] font-bold ring-1 ring-[#2C3E2D]"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FiTruck size={18} />
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider"><TranslatedText text="Livraison à domicile" arText="التوصيل إلى المنزل" /></span>
                  </div>
                  <span className="text-xs font-normal text-stone-500"><TranslatedText text="Recevez votre commande chez vous" arText="استلم طلبك حتى باب منزلك" /></span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fulfillmentMode: "pickup" })}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    formData.fulfillmentMode === "pickup"
                      ? "border-[#2C3E2D] bg-[#2C3E2D]/5 text-[#2C3E2D] font-bold ring-1 ring-[#2C3E2D]"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FiShoppingBag size={18} />
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider"><TranslatedText text="Retrait Magasin" arText="الاستلام من المتجر" /></span>
                  </div>
                  <span className="text-xs font-normal text-stone-500"><TranslatedText text="Gratuit - Récupérez sur place" arText="مجاني - استلم من الضيعة" /></span>
                </button>
              </div>
            </div>

            {/* COORDONNÉES */}
            <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-3 w-full">
              <h2 className="text-xs sm:text-sm font-bold text-[#2C3E2D] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-100">
                <FiUser size={16} /> <TranslatedText text="Coordonnées & Contact" arText="معلومات الاتصال" />
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                    <TranslatedText text="Nom complet *" arText="الاسم الكامل *" />
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mohammed Alami"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-3 text-xs sm:text-sm bg-stone-50/50 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                    <TranslatedText text="Téléphone (WhatsApp) *" arText="رقم الهاتف (واتساب) *" />
                  </label>
                  <div className="flex gap-2">
                    <div className="relative shrink-0">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="h-[44px] border border-stone-200 rounded-xl px-3 text-xs sm:text-sm bg-stone-50 font-medium focus:border-[#C5A059] focus:outline-none cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative flex-1 flex items-center">
                      <input
                        type="tel"
                        placeholder="661337729"
                        value={localPhone}
                        onChange={(e) => setLocalPhone(e.target.value)}
                        className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50/50 focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ADRESSE DE LIVRAISON OU RETRAIT */}
            {formData.fulfillmentMode === "delivery" ? (
              <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4 w-full">
                <h2 className="text-xs sm:text-sm font-bold text-[#2C3E2D] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-100">
                  <TranslatedText text="Adresse de Livraison" arText="عنوان التوصيل" />
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. PAYS */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                        <TranslatedText text="1. Pays *" arText="1. الدولة *" />
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full border border-stone-200 rounded-xl p-3 text-xs sm:text-sm bg-stone-50/50 focus:border-[#C5A059] focus:outline-none cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. VILLE */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                        <TranslatedText text="2. Ville *" arText="2. المدينة *" />
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Settat, Casablanca..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border border-stone-200 rounded-xl p-3 text-xs sm:text-sm bg-stone-50/50 focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 3. ADRESSE DÉTAILLÉE + GÉOLOCALISATION GPS */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-stone-800">
                        <TranslatedText text="3. Adresse détaillée *" arText="3. العنوان التفصيلي *" />
                      </label>
                      <button
                        type="button"
                        onClick={handleShareLocation}
                        disabled={gettingLocation}
                        className="inline-flex items-center gap-1.5 text-xs text-[#2C3E2D] font-bold hover:underline cursor-pointer bg-[#2C3E2D]/5 px-3 py-1 rounded-lg border border-[#2C3E2D]/20 transition"
                      >
                        <FiMapPin size={14} className="text-[#C5A059]" />
                        <span>
                          {gettingLocation ? (
                            <TranslatedText text="Localisation..." arText="جاري التحديد..." />
                          ) : (
                            <TranslatedText text="Partager ma position GPS" arText="مشاركة موقعي الجغرافي" />
                          )}
                        </span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Rue, Quartier, Numéro d'appartement..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl p-3 text-xs sm:text-sm bg-stone-50/50 focus:border-[#C5A059] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1">
                      <TranslatedText text="Mode d'expédition" arText="طريقة الشحن" />
                    </label>
                    <select
                      value={formData.shippingMode}
                      onChange={(e) => setFormData({ ...formData, shippingMode: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl p-3 text-xs sm:text-sm bg-stone-50/50 focus:border-[#C5A059] focus:outline-none cursor-pointer"
                    >
                      <option value="standard"><TranslatedText text="Standard (Interne - 20 MAD)" arText="عادي (داخلي - 20 درهم)" /></option>
                      <option value="amana"><TranslatedText text="Amana (National - 35 MAD)" arText="أمانة (وطني - 35 درهم)" /></option>
                      <option value="express"><TranslatedText text="Express (Rapide - 50 MAD)" arText="سريع (50 درهم)" /></option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* RETRAIT MAGASIN SANS DATES PRÉ-REMPLIES */
              <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4 w-full">
                <h2 className="text-xs sm:text-sm font-bold text-[#2C3E2D] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-100">
                  <TranslatedText text="Retrait Magasin" arText="الاستلام من المتجر" />
                </h2>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="text-xs sm:text-sm font-bold text-stone-900"><TranslatedText text="Plaza D'Oliviers, Settat" arText="بلازا د أوليفييه، سطات" /></p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex text-xs sm:text-sm font-semibold text-stone-800 mb-1 items-center gap-1">
                      <FiClock size={14} /> <TranslatedText text="Date de retrait *" arText="تاريخ الاستلام *" />
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl p-3 text-xs sm:text-sm bg-stone-50/50 focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex text-xs sm:text-sm font-semibold text-stone-800 mb-1 items-center gap-1">
                      <FiClock size={14} /> <TranslatedText text="Heure de retrait *" arText="وقت الاستلام *" />
                    </label>
                    <input
                      type="time"
                      min={
                        formData.pickupDate === new Date().toISOString().split("T")[0]
                          ? new Date(Date.now() + 15 * 60000).toTimeString().slice(0, 5)
                          : "08:00"
                      }
                      max="19:00"
                      value={formData.pickupTime}
                      onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl p-3 text-xs sm:text-sm bg-stone-50/50 focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PAIEMENT : ESPÈCES OU VIREMENT BANCAIRE */}
            <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4 w-full">
              <h2 className="text-xs sm:text-sm font-bold text-[#2C3E2D] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-100">
                <TranslatedText text="Mode de Paiement" arText="طريقة الدفع" />
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setFormData({ ...formData, paymentMethod: "cash_on_delivery" })}
                  className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition ${
                    formData.paymentMethod === "cash_on_delivery"
                      ? "border-[#C5A059] bg-[#C5A059]/5 ring-1 ring-[#C5A059]"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FiDollarSign size={22} className="text-[#C5A059]" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-stone-900">
                        <TranslatedText text="Paiement à la livraison" arText="الدفع عند الاستلام" />
                      </p>
                      <p className="text-xs text-stone-500">
                        <TranslatedText text="Espèces à la réception" arText="نقداً عند الاستلام" />
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={formData.paymentMethod === "cash_on_delivery"}
                    onChange={() => {}}
                    className="accent-[#C5A059]"
                  />
                </label>

                <label
                  onClick={() => setFormData({ ...formData, paymentMethod: "bank_transfer" })}
                  className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition ${
                    formData.paymentMethod === "bank_transfer"
                      ? "border-[#C5A059] bg-[#C5A059]/5 ring-1 ring-[#C5A059]"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FiCreditCard size={22} className="text-[#2C3E2D]" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-stone-900">
                        <TranslatedText text="Virement bancaire" arText="تحويل بانكي" />
                      </p>
                      <p className="text-xs text-stone-500">
                        <TranslatedText text="Sur le compte Hanout Bladi" arText="على حساب حانوت بلادي" />
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={formData.paymentMethod === "bank_transfer"}
                    onChange={() => {}}
                    className="accent-[#C5A059]"
                  />
                </label>
              </div>

              {formData.paymentMethod === "bank_transfer" && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm space-y-1.5">
                  <p className="font-bold text-stone-800">
                    <TranslatedText text="Coordonnées bancaires pour le virement :" arText="المعلومات البنكية للتحويل:" />
                  </p>
                  <p className="text-stone-700 font-mono select-all">
                    Banque: <strong>Attijariwafa Bank</strong>
                  </p>
                  <p className="text-stone-700 font-mono select-all">
                    RIB: <strong>007 810 0001234567890123 45</strong>
                  </p>
                  <p className="text-xs text-stone-500 italic">
                    <TranslatedText
                      text="Veuillez envoyer le reçu de virement par WhatsApp après la commande."
                      arText="يرجى إرسال إيصال التحويل عبر الواتساب بعد تأكيد الطلب."
                    />
                  </p>
                </div>
              )}
            </div>

            {/* Bouton de Validation Final (Unique moyen de valider) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-[#2C3E2D] hover:bg-[#1E2D20] text-white font-bold text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FiCheckCircle size={20} />
              <span>
                {loading ? (
                  <TranslatedText text="Traitement en cours..." arText="جاري المعالجة..." />
                ) : (
                  <TranslatedText text="Valider ma commande" arText="تأكيد طلبي" />
                )}
              </span>
            </button>
          </form>
        </section>

        {/* Panier Latéral STICKY (Droite - 3 à 4 Colonnes) */}
        <aside className="lg:sticky lg:top-6 lg:col-span-4 xl:col-span-3 space-y-4 w-full">
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-md flex flex-col">
            
            {/* TOTAL EN HAUT */}
            <div className="border-b border-stone-100 p-4 bg-stone-50/80 shrink-0 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e9efe4] text-[#2c3e2d]">
                    <FiShoppingBag size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-serif text-sm font-bold text-stone-900">
                      <TranslatedText text="Panier" arText="السلة" />
                    </h2>
                    <p className="text-xs text-stone-500">
                      {cartCount} <TranslatedText text="article(s)" arText="منتج" />
                    </p>
                  </div>
                </div>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f4edda] px-1.5 text-xs font-extrabold text-[#80652f]">
                  {cartCount}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-200/60 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span><TranslatedText text="Sous-total" arText="المجموع الفرعي" /></span>
                  <span className="font-semibold"><Price amountInMAD={subtotal} /></span>
                </div>
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span><TranslatedText text="Remise lots" arText="تخفيض المجموعات" /></span>
                    <span className="font-semibold">-<Price amountInMAD={bundleDiscount} /></span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span><TranslatedText text="Livraison" arText="التوصيل" /></span>
                  <span className="font-semibold"><Price amountInMAD={shippingFee} /></span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-200 font-black text-sm sm:text-base text-[#2C3E2D]">
                  <span><TranslatedText text="Total :" arText="المجموع:" /></span>
                  <span className="text-base sm:text-lg"><Price amountInMAD={grandTotal} /></span>
                </div>
              </div>
            </div>

            {/* LISTE DES ARTICLES */}
            <div className="p-3 max-h-[320px] overflow-y-auto space-y-2">
              {cartItems.map((item: any) => {
                const itemImage = item.image || FALLBACK_IMAGE;
                return (
                  <div key={item.id} className="flex gap-2.5 rounded-xl border border-stone-100 bg-[#faf9f5] p-2 items-center">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-white">
                      <img src={itemImage} alt={item.name_fr} className="object-contain h-full w-full p-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs sm:text-sm font-bold text-stone-800">
                        <TranslatedText text={item.name_fr} arText={item.name_ar} />
                      </h3>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-extrabold text-[#2c3e2d]">
                          <Price amountInMAD={item.price} />
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
                          >
                            <FiMinus size={10} />
                          </button>
                          <span className="min-w-4 text-center text-xs font-bold text-stone-700">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
                          >
                            <FiPlus size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="ms-1 flex h-5 w-5 items-center justify-center rounded-md text-stone-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 p-2.5 bg-stone-50/30 text-center">
              <p className="text-xs text-stone-400">
                <TranslatedText text="Paiement 100% sécurisé à la réception" arText="الدفع 100% آمن عند الاستلام" />
              </p>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}