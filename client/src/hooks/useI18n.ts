/**
 * useI18n Hook
 * Provides translation functionality and language switching
 */

import { useState, useCallback, useEffect } from "react";
import { getCurrentLanguage, setLanguage, t, toggleLanguage, type Language, type TranslationStrings, getTranslations } from "@/lib/i18n";

export function useI18n() {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());
  const [translations, setTranslations] = useState<TranslationStrings>(getTranslations());

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    setLanguageState(lang);
    setTranslations(getTranslations());
    // Trigger re-render of all components using this hook
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: lang } }));
  }, []);

  const handleToggleLanguage = useCallback(() => {
    const newLang = toggleLanguage();
    setLanguageState(newLang);
    setTranslations(getTranslations());
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: newLang } }));
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageState(getCurrentLanguage());
      setTranslations(getTranslations());
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    return () => window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  return {
    language,
    setLanguage: handleSetLanguage,
    toggleLanguage: handleToggleLanguage,
    t,
    translations,
  };
}
