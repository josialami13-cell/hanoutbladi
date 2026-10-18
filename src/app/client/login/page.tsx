"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import TranslatedText from "@/components/TranslatedText";
import { useLanguage } from "@/context/LanguageContext";
import { FiPhone, FiLock, FiUser, FiArrowLeft, FiArrowRight, FiEye, FiEyeOff, FiShield } from "react-icons/fi";

export default function ClientLoginPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fonction de validation d'un mot de passe fort
  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return isAr ? "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل" : "Le mot de passe doit contenir au moins 8 caractères.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    // Vérification de sécurité pour l'inscription
    if (!isLogin) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    }

    setLoading(true);

    if (isLogin) {
      // Connexion sécurisée avec le téléphone, le mot de passe et le type client
      const res = await signIn("credentials", {
        redirect: false,
        identifier: cleanPhone,
        password,
        loginType: "client", // <--- Cible explicitement la table Client
      });

      if (res?.error) {
        toast.error(isAr ? "رقم الهاتف أو كلمة المرور غير صحيحة" : "Numéro de téléphone ou mot de passe incorrect");
      } else {
        toast.success(isAr ? "تم تسجيل الدخول بنجاح!" : "Connexion réussie !");
        // Synchronisation fluide du cookie de session et redirection vers le dashboard
        setTimeout(() => {
          router.push("/client");
          router.refresh();
        }, 400);
      }
    } else {
      // Inscription sécurisée
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone: cleanPhone, password }),
        });

        const data = await res.json();
        if (res.ok) {
          toast.success(isAr ? "تم إنشاء الحساب بنجاح! قم بتسجيل الدخول." : "Compte créé avec succès ! Connectez-vous.");
          setIsLogin(true);
        } else {
          toast.error(data.error || (isAr ? "خطأ أثناء التسجيل" : "Erreur lors de l'inscription"));
        }
      } catch (err) {
        toast.error(isAr ? "خطأ في الخادم" : "Erreur serveur");
      }
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-16 px-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-md mx-auto">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-[#2C3E2D] mb-6 transition"
        >
          {isAr ? <FiArrowRight size={14} /> : <FiArrowLeft size={14} />} 
          <TranslatedText text="Retour à la boutique" arText="العودة إلى المتجر" />
        </Link>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl space-y-6 relative overflow-hidden">
          {/* Badge de sécurité */}
          <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-700 px-4 py-1 rounded-bl-2xl text-[10px] font-bold flex items-center gap-1 border-l border-b border-emerald-100">
            <FiShield size={12} /> <TranslatedText text="Sécurisé SSL" arText="اتصال آمن" />
          </div>

          <div className="text-center space-y-1 pt-2">
            <h1 className="text-2xl font-serif font-extrabold text-stone-900">
              {isLogin ? (
                <TranslatedText text="Espace Client Sécurisé" arText="فضاء الزبون الآمن" />
              ) : (
                <TranslatedText text="Créer un compte protégé" arText="إنشاء حساب محمي" />
              )}
            </h1>
            <p className="text-xs text-stone-500 font-light">
              {isLogin ? (
                <TranslatedText text="Authentification chiffrée par numéro de téléphone" arText="تسجيل الدخول المشفر برقم الهاتف" />
              ) : (
                <TranslatedText text="Protection renforcée de vos données personnelles" arText="حماية مشددة لبياناتك الشخصية" />
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  <TranslatedText text="Nom complet" arText="الاسم الكامل" />
                </label>
                <div className="relative flex items-center">
                  <span className={`absolute ${isAr ? "right-3" : "left-3"} text-stone-400 pointer-events-none`}>
                    <FiUser size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "اسمك الكامل" : "Votre nom"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-[#FAF9F5] border border-stone-200 rounded-2xl py-3.5 ${isAr ? "pr-10 pl-3 text-right" : "pl-10 pr-3 text-left"} text-sm text-stone-900 focus:ring-2 focus:ring-[#2C3E2D] focus:outline-none transition`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                <TranslatedText text="Numéro de téléphone" arText="رقم الهاتف" />
              </label>
              <div className="relative flex items-center">
                <span className={`absolute ${isAr ? "right-3" : "left-3"} text-stone-400 pointer-events-none`}>
                  <FiPhone size={16} />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="06XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-[#FAF9F5] border border-stone-200 rounded-2xl py-3.5 ${isAr ? "pr-10 pl-3 text-right" : "pl-10 pr-3 text-left"} text-sm text-stone-900 focus:ring-2 focus:ring-[#2C3E2D] focus:outline-none transition`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  <TranslatedText text="Mot de passe" arText="كلمة المرور" />
                </label>
                {isLogin && (
                  <Link
                    href="/shop/forgot-password"
                    className="text-[11px] text-[#C5A059] hover:underline font-bold"
                  >
                    <TranslatedText text="Mot de passe oublié ?" arText="نسيت كلمة المرور؟" />
                  </Link>
                )}
              </div>
              <div className="relative flex items-center">
                <span className={`absolute ${isAr ? "right-3" : "left-3"} text-stone-400 pointer-events-none`}>
                  <FiLock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#FAF9F5] border border-stone-200 rounded-2xl py-3.5 ${isAr ? "pr-10 pl-10 text-right" : "pl-10 pr-10 text-left"} text-sm text-stone-900 focus:ring-2 focus:ring-[#2C3E2D] focus:outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isAr ? "left-3" : "right-3"} text-stone-400 hover:text-stone-600 cursor-pointer`}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-[10px] text-stone-400 mt-1">
                  <TranslatedText text="Minimum 8 caractères requis." arText="8 أحرف على الأقل مطلوبة." />
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2C3E2D] hover:bg-[#1f2b20] text-white font-bold rounded-full transition shadow-lg cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {loading ? (
                <TranslatedText text="Patientez..." arText="جاري التحقق..." />
              ) : isLogin ? (
                <TranslatedText text="Se connecter" arText="تسجيل الدخول" />
              ) : (
                <TranslatedText text="S'inscrire en toute sécurité" arText="التسجيل بأمان تام" />
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-[#2C3E2D] font-bold hover:underline cursor-pointer"
            >
              {isLogin ? (
                <TranslatedText text="Pas encore de compte ? S'inscrire" arText="ليس لديك حساب؟ سجل الآن" />
              ) : (
                <TranslatedText text="Déjà un compte ? Se connecter" arText="لديك حساب بالفعل؟ سجل دخولك" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}