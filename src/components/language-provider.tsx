"use client";

import { useEffect, type ReactNode } from "react";
import { create } from "zustand";

export type LanguageCode = "en" | "id";

type LanguageState = {
  hydrated: boolean;
  language: LanguageCode;
  hydrate: () => void;
  setLanguage: (language: LanguageCode) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = "ds-language";
const DEFAULT_LANGUAGE: LanguageCode = "en";

function parseLanguage(value: string | null | undefined): LanguageCode | null {
  if (value === "en" || value === "id") {
    return value;
  }

  return null;
}

function readStoredLanguage(): LanguageCode | null {
  try {
    return parseLanguage(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveLanguage(language: LanguageCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Ignore blocked storage.
  }
}

function applyLanguage(language: LanguageCode): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = language;
}

function getInitialLanguage(): LanguageCode {
  if (typeof document === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const fromDom = parseLanguage(document.documentElement.lang);
  if (fromDom) {
    return fromDom;
  }

  const fromStorage = readStoredLanguage();
  if (fromStorage) {
    return fromStorage;
  }

  return DEFAULT_LANGUAGE;
}

export const useLanguage = create<LanguageState>((set, get) => {
  const initialLanguage = getInitialLanguage();

  return {
    hydrated: false,
    language: initialLanguage,
    hydrate: () => {
      const language = readStoredLanguage() ?? parseLanguage(document.documentElement.lang) ?? DEFAULT_LANGUAGE;
      applyLanguage(language);
      set({
        hydrated: true,
        language,
      });
    },
    setLanguage: (language) => {
      applyLanguage(language);
      saveLanguage(language);
      set({ language });
    },
    toggleLanguage: () => {
      const { language, setLanguage } = get();
      setLanguage(language === "en" ? "id" : "en");
    },
  };
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const hydrate = useLanguage((state) => state.hydrate);
  const language = useLanguage((state) => state.language);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  return children;
}
