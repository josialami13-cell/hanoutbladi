"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export interface TranslatedTextProps {
  text: string;           // Texte par défaut (Français)
  arText?: string | null; // Arabe
  enText?: string | null; // Anglais
  esText?: string | null; // Espagnol
  deText?: string | null; // Allemand
  className?: string;
}

// Cache global en mémoire pour éviter de réappeler l'API pour un texte déjà traduit
const translationCache = new Map<string, string>();

export default function TranslatedText({
  text,
  arText,
  enText,
  esText,
  deText,
  className,
}: TranslatedTextProps) {
  const { language, t, translateWithAI } = useLanguage();

  // Fonction pour déterminer le texte statique s'il est fourni dans les props
  const getExplicitTextForLanguage = (lang: string): string | null => {
    switch (lang) {
      case "fr":
        return text;
      case "ar":
        return arText && arText.trim() !== "" ? arText : null;
      case "en":
        return enText && enText.trim() !== "" ? enText : null;
      case "es":
        return esText && esText.trim() !== "" ? esText : null;
      case "de":
        return deText && deText.trim() !== "" ? deText : null;
      default:
        return null;
    }
  };

  const getInitialText = () => {
    const explicitText = getExplicitTextForLanguage(language);
    if (explicitText) {
      return explicitText;
    }

    if (language === "fr") return text;

    const cacheKey = `${language}_${text}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    return t(text, arText);
  };

  const [displayText, setDisplayText] = useState<string>(getInitialText);

  useEffect(() => {
    let isMounted = true;

    // 1. Si une traduction explicite existe dans les props pour la langue actuelle
    const explicitText = getExplicitTextForLanguage(language);
    if (explicitText) {
      setDisplayText(explicitText);
      return;
    }

    // 2. Si la langue est le français (fallback de base)
    if (language === "fr") {
      setDisplayText(text);
      return;
    }

    // 3. Vérification du cache en mémoire
    const cacheKey = `${language}_${text}`;
    if (translationCache.has(cacheKey)) {
      setDisplayText(translationCache.get(cacheKey)!);
      return;
    }

    // 4. Appel de traduction dynamique IA si aucune prop explicite n'a été trouvée
    translateWithAI(text).then((translated) => {
      if (isMounted && translated) {
        translationCache.set(cacheKey, translated);
        setDisplayText(translated);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [language, text, arText, enText, esText, deText]); // Synchronisation propre des props

  return <span className={className}>{displayText}</span>;
}