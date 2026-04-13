"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_NAME,
  parseLanguage,
  type LanguageCode,
} from "@/shared/lib/ui-preferences";

type LanguageState = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = LANGUAGE_COOKIE_NAME;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readStoredLanguage(): LanguageCode | null {
  try {
    return parseLanguage(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveLanguage(language: LanguageCode) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Ignore blocked storage.
  }

  document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(language)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function applyLanguage(language: LanguageCode): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = language;
}

const defaultLanguageState: LanguageState = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => undefined,
  toggleLanguage: () => undefined,
};

const LanguageContext = createContext<LanguageState>(defaultLanguageState);

export function useLanguage<T>(selector: (state: LanguageState) => T): T {
  return selector(useContext(LanguageContext));
}

type LanguageProviderProps = {
  children: ReactNode;
  initialLanguage?: LanguageCode;
};

export function LanguageProvider({ children, initialLanguage = DEFAULT_LANGUAGE }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") {
      return initialLanguage;
    }

    return readStoredLanguage() ?? initialLanguage;
  });

  useEffect(() => {
    applyLanguage(language);
    saveLanguage(language);
  }, [language]);

  const commitLanguage = (nextLanguage: LanguageCode) => {
    applyLanguage(nextLanguage);
    saveLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  };

  const value = useMemo<LanguageState>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        commitLanguage(nextLanguage);
      },
      toggleLanguage: () => {
        commitLanguage(language === "en" ? "id" : "en");
      },
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export type { LanguageCode };
