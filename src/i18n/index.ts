"use client";

import { useCallback } from "react";
import { useLanguage } from "@/components/language-provider";
import { translate, type TemplateValues } from "@/i18n/core";

export function useI18n() {
  const language = useLanguage((state) => state.language);
  const setLanguage = useLanguage((state) => state.setLanguage);
  const toggleLanguage = useLanguage((state) => state.toggleLanguage);

  const t = useCallback(
    (text: string, values?: TemplateValues) => translate(text, language, values),
    [language],
  );

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };
}

export { translate };
