"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "fr" | "ar" | "en" | "es" | "de" | string;
export type Currency = "MAD" | "EUR" | "USD" | string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: (fr: string, ar?: string | null) => string;
  translateWithAI: (text: string) => Promise<string>;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cache mémoire dynamique pour les traductions
const translationCache: Record<string, string> = {};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");
  const [currency, setCurrencyState] = useState<Currency>("MAD");

  useEffect(() => {
    // Restauration de la langue
    const savedLang = localStorage.getItem("hanout_lang") as Language;
    if (savedLang) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    }

    // Restauration de la devise
    const savedCurrency = localStorage.getItem("hanout_currency") as Currency;
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("hanout_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem("hanout_currency", curr);
  };

  const t = (fr: string, ar?: string | null) => {
    if (language === "ar" && ar && ar.trim() !== "") {
      return ar;
    }
    return fr;
  };

  const translateWithAI = async (text: string): Promise<string> => {
    if (!text || text.trim() === "") return "";
    if (language === "fr") return text;

    const cacheKey = `${language}:${text}`;
    
    if (translationCache[cacheKey] && translationCache[cacheKey] !== text) {
      return translationCache[cacheKey];
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: language }),
      });

      if (!res.ok) return text;

      const data = await res.json();
      
      if (data.translatedText && data.translatedText !== text) {
        translationCache[cacheKey] = data.translatedText;
        return data.translatedText;
      }
    } catch (err) {
      console.error("Erreur de traduction réseau:", err);
    }

    return text;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        currency, 
        setCurrency, 
        t, 
        translateWithAI, 
        dir 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}