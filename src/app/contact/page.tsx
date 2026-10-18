"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiSend, 
  FiArrowLeft,
  FiMessageSquare
} from "react-icons/fi";
import TranslatedText from "@/components/TranslatedText";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Envoi direct via WhatsApp
    const whatsappMessage = 
      `*MESSAGE DE CONTACT - HANOUT BLADI*\n\n` +
      `👤 *Nom :* ${formData.name}\n` +
      `📞 *Téléphone :* ${formData.phone}\n` +
      `📌 *Sujet :* ${formData.subject}\n\n` +
      `💬 *Message :*\n${formData.message}`;

    window.open(`https://wa.me/212661337729?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
    toast.success("Redirection vers WhatsApp...");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#2C3E2D] selection:text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-[#C5A059] mb-6 transition font-medium"
        >
          <FiArrowLeft /> <TranslatedText text="Retour à l'accueil" arText="العودة إلى الرئيسية" />
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            <TranslatedText text="Contactez-nous" arText="اتصل بنا" />
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed">
            <TranslatedText 
              text="Une question sur nos produits du terroir ou sur votre commande ? L'équipe Hanout Bladi est à votre écoute." 
              arText="سؤال حول منتجاتنا المحلية أو طلبك؟ فريق Hanout Bladi رهن إشارتكم." 
            />
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* INFORMATIONS PRATIQUES */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-6">
              <h2 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
                <TranslatedText text="Nos Coordonnées" arText="معلومات الاتصال" />
              </h2>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#2C3E2D]/10 text-[#2C3E2D] rounded-xl flex-shrink-0">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-xs"><TranslatedText text="Adresse" arText="العنوان" /></h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed font-light">
                    FERME PLAZA D OLIVIERS , DOUAR GHRABA, SETTAT, Maroc.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#2C3E2D]/10 text-[#2C3E2D] rounded-xl flex-shrink-0">
                  <FiPhone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-xs"><TranslatedText text="Téléphone & WhatsApp" arText="الهاتف وواتساب" /></h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 font-light">+212 6 61337729</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#2C3E2D]/10 text-[#2C3E2D] rounded-xl flex-shrink-0">
                  <FiMail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-xs"><TranslatedText text="Email" arText="البريد الإلكتروني" /></h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 font-light">contact@hanoutbladi.ma</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#2C3E2D]/10 text-[#2C3E2D] rounded-xl flex-shrink-0">
                  <FiClock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-xs"><TranslatedText text="Horaires d'ouverture" arText="ساعات العمل" /></h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 font-light">
                    <TranslatedText text="Mardi - Samedi : 09:00 - 19:00" arText="الثلاثاء - السبت: 09:00 - 19:00" />
                  </p>
                  <p className="text-[10px] text-stone-400 font-light">
                    <TranslatedText text="Lundi : Fermé" arText="الإثنين: مغلق" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULAIRE DE CONTACT */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-stone-200/90 shadow-2xs">
            <h2 className="text-lg font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
              <FiMessageSquare className="text-[#C5A059]" /> <TranslatedText text="Envoyez-nous un message" arText="أرسل لنا رسالة" />
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    <TranslatedText text="Nom complet *" arText="الاسم الكامل *" />
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Votre nom"
                    className="w-full border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#C5A059] bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    <TranslatedText text="Téléphone *" arText="رقم الهاتف *" />
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06XX XX XX XX"
                    className="w-full border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#C5A059] bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  <TranslatedText text="Sujet *" arText="الموضوع *" />
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Demande de renseignement, Commande sur mesure..."
                  className="w-full border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#C5A059] bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  <TranslatedText text="Message *" arText="الرسالة *" />
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Écrivez votre message ici..."
                  className="w-full border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#C5A059] bg-stone-50/50 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2C3E2D] hover:bg-[#1a261c] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <FiSend /> <TranslatedText text="Envoyer via WhatsApp" arText="الإرسال عبر واتساب" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}