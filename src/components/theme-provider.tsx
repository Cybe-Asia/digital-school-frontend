"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type ThemeId, type ThemeMode, type ThemePalette } from "@/components/theme-config";
import {
  DEFAULT_THEME_ID,
  THEME_COOKIE_NAME,
  parseThemeId,
  splitThemeId,
  toThemeId,
} from "@/shared/lib/ui-preferences";

type ThemeState = {
  palette: ThemePalette;
  mode: ThemeMode;
  themeId: ThemeId;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPalette: (palette: ThemePalette) => void;
};

const STORAGE_KEY = THEME_COOKIE_NAME;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type { ThemeId, ThemeMode, ThemePalette } from "@/components/theme-config";
export { paletteOptions } from "@/components/theme-config";

function applyTheme(themeId: ThemeId): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = themeId;
}

function readStoredThemeId(): ThemeId | null {
  try {
    return parseThemeId(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveThemeId(themeId: ThemeId) {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    // Ignore blocked storage.
  }

  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(themeId)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

const defaultThemeState = splitThemeId(DEFAULT_THEME_ID);
const defaultContextValue: ThemeState = {
  palette: defaultThemeState.palette,
  mode: defaultThemeState.mode,
  themeId: DEFAULT_THEME_ID,
  setMode: () => undefined,
  toggleMode: () => undefined,
  setPalette: () => undefined,
};

const ThemeContext = createContext<ThemeState>(defaultContextValue);

export function useTheme<T>(selector: (state: ThemeState) => T): T {
  return selector(useContext(ThemeContext));
}

type ThemeProviderProps = {
  children: ReactNode;
  initialThemeId?: ThemeId;
};

export function ThemeProvider({ children, initialThemeId = DEFAULT_THEME_ID }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === "undefined") {
      return initialThemeId;
    }

    return readStoredThemeId() ?? initialThemeId;
  });

  useEffect(() => {
    applyTheme(themeId);
    saveThemeId(themeId);
  }, [themeId]);

  const themeState = splitThemeId(themeId);
  const commitThemeId = (nextThemeId: ThemeId) => {
    applyTheme(nextThemeId);
    saveThemeId(nextThemeId);
    setThemeId(nextThemeId);
  };
  const value = useMemo<ThemeState>(
    () => ({
      palette: themeState.palette,
      mode: themeState.mode,
      themeId,
      setMode: (mode) => {
        commitThemeId(toThemeId(themeState.palette, mode));
      },
      toggleMode: () => {
        commitThemeId(toThemeId(themeState.palette, themeState.mode === "dark" ? "light" : "dark"));
      },
      setPalette: (palette) => {
        commitThemeId(toThemeId(palette, themeState.mode));
      },
    }),
    [themeId, themeState.mode, themeState.palette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
