// =============================================================
// HEADER MULTILINGUE (5 Langues) - Hanout Bladi / Plaza D'Oliviers
// Version Équilibrée & Lisible
// =============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiShoppingCart, FiMenu, FiX, FiUser, FiHome, FiGrid } from "react-icons/fi";
import { useCartStore } from "@/store/cart";
import { useLanguage } from "@/context/LanguageContext";
import LanguageCurrencySelector from "@/components/LanguageCurrencySelector";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language } = useLanguage() as { language: string };
  const isAr = language === "ar";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useCartStore((state) => state.items);
  const totalItems = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const nav = {
    home: { fr: "Accueil", ar: "الرئيسية", en: "Home", es: "Inicio", de: "Startseite" },
    shop: { fr: "Boutique", ar: "المتجر", en: "Shop", es: "Tienda", de: "Shop" },
    blog: { fr: "Blog", ar: "المدونة", en: "Blog", es: "Blog", de: "Blog" },
    about: { fr: "À propos", ar: "من نحن", en: "About", es: "Acerca de", de: "Über uns" },
    contact: { fr: "Contact", ar: "اتصل بنا", en: "Contact", es: "Contacto", de: "Kontakt" },
    clientArea: { fr: "Espace Client", ar: "فضاء الزبون", en: "Client Area", es: "Área de Clientes", de: "Kundenbereich" },
    cart: { fr: "Panier", ar: "السلة", en: "Cart", es: "Carrito", de: "Warenkorb" },
  };

  const getT = (key: keyof typeof nav) => (nav[key] as any)[language] || nav[key].fr;

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      {/* --- BARRE SUPÉRIEURE (DESKTOP) --- */}
      <div className="bg-[#2C3E2D] text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#A2D95B] transition font-medium">
              Facebook
            </a>
            <a href="#" className="hover:text-[#A2D95B] transition font-medium">
              Instagram
            </a>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs opacity-90">
            <span>📞 +212 661 337 729</span>
            <span>✉️ contact@hanoutbladi.ma</span>
          </div>
        </div>
      </div>

      {/* --- HEADER PRINCIPAL - HAUTEUR AGRÉABLE (h-16 md:h-18) --- */}
      <header className="bg-white/95 backdrop-blur-md shadow-xs sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 md:h-18">
            
            {/* Logo agrandi et lisible */}
            <Link href="/" className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#3B4D3C] notranslate">
              Hanout<span className="text-[#6B8E23]">Bladi</span>
            </Link>

            {/* Navigation Desktop aérée */}
            <ul className="hidden md:flex items-center gap-8 text-sm font-bold text-stone-700">
              <li>
                <Link href="/" className="hover:text-[#6B8E23] transition">
                  {getT("home")}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#6B8E23] transition">
                  {getT("shop")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#6B8E23] transition">
                  {getT("blog")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#6B8E23] transition">
                  {getT("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#6B8E23] transition">
                  {getT("contact")}
                </Link>
              </li>
            </ul>

            {/* Actions Header */}
            <div className="flex items-center gap-3 md:gap-4">
              
              <LanguageCurrencySelector />

              <div className="relative hidden sm:block">
                <Link
                  href="/client"
                  className="flex items-center gap-2 bg-[#E9EFE3] hover:bg-[#DDE7D3] text-[#3B4D3C] px-3.5 py-2 rounded-xl text-xs font-bold transition border border-[#D5E2C8] cursor-pointer"
                >
                  <FiUser className="text-[#6B8E23] text-sm" />
                  <span>{getT("clientArea")}</span>
                </Link>
              </div>

              <Link href="/shop/cart" className="relative p-2 text-stone-700 hover:text-[#6B8E23] transition">
                <FiShoppingCart className="text-2xl" />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-[#6B8E23] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden text-2xl text-stone-700 p-1 cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </nav>

          {/* Menu Mobile */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-stone-100 animate-fadeIn space-y-2 pt-3">
              <Link 
                href="/" 
                className="block py-2 px-3 rounded-xl font-medium text-stone-700 hover:bg-[#F4F6F0] hover:text-[#6B8E23]" 
                onClick={() => setIsMenuOpen(false)}
              >
                {getT("home")}
              </Link>
              <Link 
                href="/shop" 
                className="block py-2 px-3 rounded-xl font-medium text-stone-700 hover:bg-[#F4F6F0] hover:text-[#6B8E23]" 
                onClick={() => setIsMenuOpen(false)}
              >
                {getT("shop")}
              </Link>
              <Link 
                href="/blog" 
                className="block py-2 px-3 rounded-xl font-medium text-stone-700 hover:bg-[#F4F6F0] hover:text-[#6B8E23]" 
                onClick={() => setIsMenuOpen(false)}
              >
                {getT("blog")}
              </Link>
              <Link 
                href="/about" 
                className="block py-2 px-3 rounded-xl font-medium text-stone-700 hover:bg-[#F4F6F0] hover:text-[#6B8E23]" 
                onClick={() => setIsMenuOpen(false)}
              >
                {getT("about")}
              </Link>
              <Link 
                href="/contact" 
                className="block py-2 px-3 rounded-xl font-medium text-stone-700 hover:bg-[#F4F6F0] hover:text-[#6B8E23]" 
                onClick={() => setIsMenuOpen(false)}
              >
                {getT("contact")}
              </Link>
              <Link 
                href="/client" 
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl font-bold text-[#3B4D3C] bg-[#E9EFE3] hover:bg-[#DDE7D3] border border-[#D5E2C8]" 
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUser className="text-[#6B8E23]" />
                <span>{getT("clientArea")}</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* --- BARRE MOBILE BOTTOM NAV --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-4 shadow-lg">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center text-stone-600 hover:text-[#6B8E23] transition">
            <FiHome className="text-xl" />
            <span className="text-[10px] font-medium mt-1">{getT("home")}</span>
          </Link>
          <Link href="/shop" className="flex flex-col items-center text-stone-600 hover:text-[#6B8E23] transition">
            <FiGrid className="text-xl" />
            <span className="text-[10px] font-medium mt-1">{getT("shop")}</span>
          </Link>
          <Link href="/shop/cart" className="flex flex-col items-center text-stone-600 hover:text-[#6B8E23] relative transition">
            <div className="relative">
              <FiShoppingCart className="text-xl" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#6B8E23] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">{getT("cart")}</span>
          </Link>
          <Link href="/client" className="flex flex-col items-center text-stone-600 hover:text-[#6B8E23] transition">
            <FiUser className="text-xl" />
            <span className="text-[10px] font-medium mt-1">{getT("clientArea")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}