
"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";
import TranslatedText from "@/components/TranslatedText";

export default function Footer() {
  return (
    <footer className="bg-[#2C3E2D] text-white pt-16 pb-20 md:pb-8 border-t border-[#3B4D3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Colonne 1 : Logo + description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-white notranslate">
              Hanout<span className="text-[#A2D95B]">Bladi</span>
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed font-light">
              <TranslatedText 
                text="Votre épicerie marocaine en ligne. Les meilleurs produits du terroir bio et naturels livrés chez vous au Maroc." 
                arText="بقالتكم المغربية عبر الإنترنت. أفضل المنتجات المحلية الطبيعية والبيولوجية تُوصل إلى غايتكم في المغرب."
              />
            </p>
            {/* Réseaux sociaux */}
            <div className="flex gap-3 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-[#6B8E23] transition text-white"
              >
                <FaFacebookF size={14} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-[#6B8E23] transition text-white"
              >
                <FaInstagram size={14} />
              </a>
              <a 
                href="https://wa.me/212661337729?text=Bonjour,%20je%20souhaite%20commander%20vos%20produits." 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-[#6B8E23] transition text-white"
              >
                <FaWhatsapp size={14} />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="TikTok"
                className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-[#6B8E23] transition text-white"
              >
                <FaTiktok size={14} />
              </a>
            </div>
          </div>

          {/* Colonne 2 : Navigation Utile */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#A2D95B]">
              <TranslatedText text="Navigation" arText="التنقل" />
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300 font-light">
              <li>
                <Link href="/" className="hover:text-[#A2D95B] transition inline-block">
                  <TranslatedText text="Accueil" arText="الرئيسية" />
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#A2D95B] transition inline-block">
                  <TranslatedText text="Boutique en ligne" arText="المتجر الإلكتروني" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#A2D95B] transition inline-block">
                  <TranslatedText text="Notre Domaine & Histoire" arText="ضيعتنا وقصتنا" />
                </Link>
              </li>
              <li>
                <Link href="/client" className="hover:text-[#A2D95B] transition inline-block">
                  <TranslatedText text="Mon Compte & Commandes" arText="حسابي والطلبات" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Informations & Légal */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#A2D95B]">
              <TranslatedText text="Informations & Légal" arText="معلومات وشروط" />
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300 font-light">
              <li>
                <Link href="/cgv" className="hover:text-[#A2D95B] transition inline-block">
                  <TranslatedText text="Conditions Générales de Vente" arText="الشروط العامة للبيع" />
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#A2D95B] transition inline-block">
                  <TranslatedText text="Politique de Confidentialité" arText="سياسة الخصوصية" />
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#A2D95B] transition inline-block">
                  <TranslatedText text="Huiles d'Olive & Miel" arText="زيت الزيتون والعسل" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Contact & Localisation */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#A2D95B]">
              <TranslatedText text="Contact & Domaine" arText="التواصل والضيعة" />
            </h4>
            <ul className="space-y-3 text-sm text-stone-300 font-light">
              <li className="flex items-center gap-2">
                <span>📞</span> <span>+212 661 33 77 29</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span> <span>contact@hanoutbladi.ma</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📍</span> 
                <span>
                  <TranslatedText 
                    text="Domaine Plaza d'Oliviers, Mzamza Janoubia, Settat, Maroc" 
                    arText="ضيعة بلازا دي أوليفييه، المزامزة الجنوبية، سطات، المغرب" 
                  />
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Moyens de paiement + Copyright */}
        <div className="border-t border-white/10 mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400 font-light">
            <p>
              © {new Date().getFullYear()} Hanout Bladi • Domaine Plaza D'Oliviers. <TranslatedText text="Tous droits réservés." arText="جميع الحقوق محفوظة." />
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span>💳 <TranslatedText text="Carte bancaire" arText="بطاقة بنكية" /></span>
              <span>💵 <TranslatedText text="Paiement à la livraison" arText="الدفع عند الاستلام" /></span>
              <span>🏦 CashPlus</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
