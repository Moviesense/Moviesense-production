"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { translations, TranslationKey } from "@/lib/translations";

type Language = "en" | "ar";
type Direction = "ltr" | "rtl";

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [direction, setDirection] = useState<Direction>("ltr");

  useEffect(() => {
    const savedLang = Cookies.get("language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      updateLanguage(savedLang);
    } else {
      // Default or system preference could go here
      updateLanguage("en");
    }
  }, []);

  const updateLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    const dir = lang === "ar" ? "rtl" : "ltr";
    setDirection(dir);
    Cookies.set("language", lang, { expires: 365 });

    // Update HTML attributes
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, []);

  const setLanguage = (lang: Language) => {
    updateLanguage(lang);
  };

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[language]?.[key] || key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        setLanguage,
        isRTL: direction === "rtl",
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
