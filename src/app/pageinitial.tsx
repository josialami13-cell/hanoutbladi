// =============================================================
// PAGE D'ACCUEIL - Hanout Bladi / Domaine Plaza D'Oliviers
// =============================================================

"use client";

import Link from "next/link";
import TranslatedText from "@/components/TranslatedText";
import { FiArrowRight, FiShoppingBag, FiMapPin } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";

export default function HomePage() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  // Utilisation du store Zustand officiel du panier
  const addItem = useCartStore((state) => state.addItem);

  // Produits phares avec prix numériques et traductions FR/AR
  const featuredProducts = [
    {
      id: "1",
      name_fr: "Huile d'Olive Vierge Extra (1L)",
      name_ar: "زيت الزيتون البكر الممتاز (1 لتر)",
      category_fr: "Huile d'Olive",
      category_ar: "زيت الزيتون",
      price: 110.0,
      image: "/images/huile1l.jpg",
      slug: "huile-olive-1l",
    },
    {
      id: "2",
      name_fr: "Bidon Huile d'Olive Vierge Extra (5L)",
      name_ar: "عبوة زيت الزيتون البكر الممتاز (5 لتر)",
      category_fr: "Huile d'Olive",
      category_ar: "زيت الزيتون",
      price: 520.0,
      image: "/images/huile5l.jpg",
      slug: "huile-olive-5l",
    },
    {
      id: "3",
      name_fr: "Miel Pur de Fleurs",
      name_ar: "عسل الزهور النقي",
      category_fr: "Miel & Terroir",
      category_ar: "العسل والمنتجات المحلية",
      price: 150.0,
      image: "/images/miel.jpg",
      slug: "miel-pur",
    },
  ];

  // Fonction d'ajout au panier utilisant le store Zustand de la boutique
  const handleAddToCart = (prod: any) => {
    try {
      addItem({
        id: prod.id,
        name_fr: prod.name_fr,
        name_ar: prod.name_ar,
        price: prod.price,
        image: prod.image,
        quantity: 1,
      } as any);

      toast.success(
        isAr 
          ? `تمت إضافة "${prod.name_ar}" إلى السلة بنجاح!` 
          : `"${prod.name_fr}" a été ajouté au panier avec succès !`
      );
    } catch (err) {
      toast.error(isAr ? "خطأ أثناء الإضافة إلى السلة" : "Erreur lors de l'ajout au panier");
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen selection:bg-[#2C3E2D] selection:text-white text-stone-800" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-white overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/ferme-plaza.jpg" 
            alt="Domaine Plaza D'Oliviers Settat" 
            className="w-full h-full object-cover opacity-75 scale-105 transform transition duration-1000 notranslate"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6 py-24">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C5A059] bg-stone-900/80 border border-[#C5A059]/40 px-4 py-2 rounded-full backdrop-blur-md shadow-sm">
            <FiMapPin size={14} /> 
            <TranslatedText text="Domaine Plaza D'Oliviers • Mzamza Janoubia, Settat" arText="ضيعة بلازا أوليفييه • مزامزة الجنوبية، سطات" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-md">
            <TranslatedText text="L'Art de l'Huile d'Olive & du Terroir" arText="فن زيت الزيتون والمنتجات المحلية الأصيلة" />
          </h1>
          <p className="text-base sm:text-lg text-stone-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
            <TranslatedText 
              text="De notre oliveraie de 60 hectares à votre table. Découvrez nos cuvées d'exception en Picholine, Menara et Débia, ainsi que notre miel et amlou artisanaux." 
              arText="من بساتين الزيتون التي تبلغ مساحتها 60 هكتاراً إلى مائدتك. اكتشف تشكيلاتنا الاستثنائية من زيت الزيتون، والعسل، والأملو التقليدي." 
            />
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto bg-[#2C3E2D] hover:bg-[#1f2b20] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiShoppingBag size={16} /> 
              <span><TranslatedText text="Explorer la Boutique" arText="تصفح المتجر" /></span>
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider transition backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span><TranslatedText text="Notre Domaine" arText="ضيعتنا" /></span> <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SECTION INTERCALÉE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xs">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-inner">
            <img 
              src="/images/plaza-ferme.jpg" 
              alt="Vue de la ferme Plaza D'Oliviers" 
              className="w-full h-full object-cover hover:scale-105 transition duration-700 notranslate"
            />
          </div>
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
              <TranslatedText text="Exploitation Oléicole" arText="الإنتاج الزيتوني" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              <TranslatedText text="Un terroir unique à Settat" arText="تربة فريدة من نوعها في سطات" />
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              <TranslatedText 
                text="Nos arbres baignent sous le soleil de la région de Settat. Chaque récolte fait l'objet d'une attention rigoureuse afin d'extraire une huile vierge extra aux qualités gustatives et nutritionnelles exceptionnelles." 
                arText="تستحم أشجارنا تحت شمس منطقة سطات. تخضع كل عملية حصاد لعناية دقيقة استخلاص زيت بكر ممتاز بجودة استثنائية." 
              />
            </p>
            <div className="pt-2">
              <Link href="/shop" className="text-xs font-bold text-[#2C3E2D] hover:underline inline-flex items-center gap-1.5">
                <TranslatedText text="Découvrir nos créations" arText="اكتشف إبداعاتنا" /> <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LES INCONTOURNABLES DE LA FERME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
            <TranslatedText text="Savoir-Faire Artisanal" arText="خبرة حرفية أصيلة" />
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            <TranslatedText text="Les Incontournables de la Ferme" arText="أساسيات الضيعة" />
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            <TranslatedText text="L'essence de notre terroir récoltée et préparée avec passion à Settat." arText="خلاصة ترابنا المحلي المُجنى والمعتنى به بكل شغف في سطات." />
          </p>
        </div>

        <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-lg group">
          <img 
            src="/images/ferme-plaza1.jpg" 
            alt="Domaine Plaza D'Oliviers" 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 notranslate"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
            <div className="text-white space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059] bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                <TranslatedText text="Récolte 100% Locale" arText="محصول محلي 100%" />
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold pt-2">
                <TranslatedText text="Du cœur de l'oliveraie à votre table" arText="من قلب حقول الزيتون إلى مائدتك" />
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group">
            <div className="relative h-52 bg-stone-100 overflow-hidden flex items-center justify-center p-4">
              <img src="/images/huile1l.jpg" alt="Huile d'olive" className="w-full h-full object-contain group-hover:scale-105 transition duration-700 notranslate" />
            </div>
            <div className="p-6 text-center space-y-2">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                <TranslatedText text="Huile d'olive" arText="زيت الزيتون" />
              </h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                <TranslatedText text="Cuvées d'exception Picholine, Menara et Débia." arText="تشكيلات استثنائية: بيشولين، المنارة وديبيا." />
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group">
            <div className="relative h-52 bg-stone-100 overflow-hidden flex items-center justify-center p-4">
              <img src="/images/miel.jpg" alt="Miel pur" className="w-full h-full object-contain group-hover:scale-105 transition duration-700 notranslate" />
            </div>
            <div className="p-6 text-center space-y-2">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                <TranslatedText text="Miel" arText="عسل حر" />
              </h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                <TranslatedText text="Miel de fleurs récolté localement au domaine." arText="عسل زهور طبيعي مُجنى محلياً من الضيعة." />
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group">
            <div className="relative h-52 bg-stone-100 overflow-hidden flex items-center justify-center p-4">
              <div className="text-4xl">🌰</div>
            </div>
            <div className="p-6 text-center space-y-2">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                <TranslatedText text="Amlou" arText="أملو" />
              </h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                <TranslatedText text="Pâte à tartiner traditionnelle aux amandes." arText="معجون الدهن التقليدي باللوز البلدي." />
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group">
            <div className="relative h-52 bg-stone-100 overflow-hidden flex items-center justify-center p-4">
              <div className="text-4xl">🌿</div>
            </div>
            <div className="p-6 text-center space-y-2">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                <TranslatedText text="Olive" arText="زيتون المائدة" />
              </h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                <TranslatedText text="Olives de table préparées selon les traditions." arText="زيتون مائدة مُحضر وفق الطرق التقليدية." />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION PRODUITS PHARES (AVEC ZUSTAND PANIER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
            <TranslatedText text="Boutique en Ligne" arText="المتجر الإلكتروني" />
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            <TranslatedText text="Commandez nos Dernières Récoltes" arText="اطلب أحدث محاصيلنا" />
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {featuredProducts.map((prod) => (
            <div key={prod.id} className="bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl transition duration-300 overflow-hidden flex flex-col justify-between group">
              <div className="relative h-72 bg-stone-100 overflow-hidden flex items-center justify-center p-4">
                <img 
                  src={prod.image} 
                  alt={isAr ? prod.name_ar : prod.name_fr} 
                  className="w-full h-full object-contain group-hover:scale-105 transition duration-700 notranslate" 
                />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#2C3E2D] px-3 py-1 rounded-full shadow-xs">
                  {isAr ? prod.category_ar : prod.category_fr}
                </span>
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-[#2C3E2D] transition">
                    {isAr ? prod.name_ar : prod.name_fr}
                  </h3>
                  <p className="text-lg font-black text-[#2C3E2D]">{prod.price.toFixed(2)} MAD</p>
                </div>
                
                {/* Bouton d'ajout direct au panier via le store officiel */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(prod)}
                  className="w-full bg-[#FAF9F5] hover:bg-[#2C3E2D] hover:text-white border border-stone-200 text-stone-800 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FiShoppingBag size={14} /> 
                  <span><TranslatedText text="Commander" arText="أطلب الآن" /></span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#2C3E2D] hover:bg-[#1a261c] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
          >
            <span><TranslatedText text="Voir tout le catalogue" arText="عرض كل المنتجات" /></span> <FiArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 5. SECTION IMMERSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
            <TranslatedText text="Immersion au Domaine" arText="جولة في الضيعة" />
          </span>
          <h2 className="text-3xl font-serif font-bold text-stone-900">
            <TranslatedText text="Vivre l'Expérience Plaza D'Oliviers" arText="عش تجربة ضيعة بلازا أوليفييه" />
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg group">
            <img 
              src="/images/ferme-plaza2.jpg" 
              alt="Accueil et détente au domaine" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 notranslate"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
              <h3 className="text-xl sm:text-2xl font-serif font-bold">
                <TranslatedText text="Retrait sur Place & Accueil" arText="الاستلام من عين المكان والترحيب" />
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 font-light mt-1">
                <TranslatedText text="Venez récupérer vos commandes et profiter d'un accueil chaleureux au cœur de notre domaine à Settat." arText="تفضلوا لاستلام طلباتكم والاستمتاع باستقبال دافئ في قلب ضيعتنا بسطات." />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BANDEAU FINAL HISTOIRE */}
      <section className="bg-[#2C3E2D] text-white py-20 px-4 sm:px-6 lg:px-8 my-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/20 px-4 py-1.5 rounded-full border border-[#C5A059]/30">
            <TranslatedText text="Savoir-Faire & Passion" arText="خبرة وشغف" />
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
            <TranslatedText text="L'Excellence du Terroir à Votre Porte" arText="تميز المنتجات المحلية حتى باب منزلك" />
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 font-light leading-relaxed max-w-2xl mx-auto">
            <TranslatedText text="Commandez vos produits en ligne dès maintenant et goûtez à la différence d'un produit authentique, cultivé avec amour à Settat." arText="اطلب منتجاتك عبر الإنترنت الآن وتذوق الفرق في منتج أصيل، مُنتج بكل حب في سطات." />
          </p>
          <div className="pt-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08d4b] text-stone-900 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
            >
              <span><TranslatedText text="En savoir plus sur notre histoire" arText="اكتشف المزيد عن قصة ضيعتنا" /></span> <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}