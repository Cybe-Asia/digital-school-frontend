"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type ThemePalette = "option1" | "option2" | "option3" | "option4" | "option5";
export type ThemeId = `${ThemePalette}-${ThemeMode}`;

type ThemeState = {
  palette: ThemePalette;
  mode: ThemeMode;
};

type ThemeContextValue = {
  mode: ThemeMode;
  palette: ThemePalette;
  themeId: ThemeId;
  setPalette: (palette: ThemePalette) => void;
  toggleMode: () => void;
};

const STORAGE_KEY = "ds-theme-id";
const DEFAULT_PALETTE: ThemePalette = "option2";

export const paletteOptions: Array<{ id: ThemePalette; label: string }> = [
  { id: "option1", label: "Option 1 · Modern Islamic Minimal" },
  { id: "option2", label: "Option 2 · Contemporary Education Tech" },
  { id: "option3", label: "Option 3 · Heritage Meets Future" },
  { id: "option4", label: "Option 4 · Clean Academic White" },
  { id: "option5", label: "Option 5 · Youth Islamic Contemporary" },
];

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function detectSystemMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function toThemeId(state: ThemeState): ThemeId {
  return `${state.palette}-${state.mode}`;
}

function parseThemeId(value: string | null | undefined): ThemeState | null {
  if (!value) {
    return null;
  }

  const match = /^(option[1-5])-(light|dark)$/.exec(value);

  if (!match) {
    return null;
  }

  return {
    palette: match[1] as ThemePalette,
    mode: match[2] as ThemeMode,
  };
}

function applyTheme(state: ThemeState): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = toThemeId(state);
}

function saveTheme(state: ThemeState): void {
  try {
    localStorage.setItem(STORAGE_KEY, toThemeId(state));
  } catch {
    // Ignore storage failures (private mode, blocked storage).
  }
}

function getInitialState(): ThemeState {
  if (typeof document === "undefined") {
    return { palette: DEFAULT_PALETTE, mode: "light" };
  }

  const fromDom = parseThemeId(document.documentElement.dataset.theme);
  if (fromDom) {
    return fromDom;
  }

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  const fromStorage = parseThemeId(stored);
  if (fromStorage) {
    applyTheme(fromStorage);
    return fromStorage;
  }

  const fallback: ThemeState = {
    palette: DEFAULT_PALETTE,
    mode: detectSystemMode(),
  };

  applyTheme(fallback);
  return fallback;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(getInitialState);

  const value = useMemo<ThemeContextValue>(() => {
    const setPalette = (palette: ThemePalette) => {
      setState((previous) => {
        const next: ThemeState = { ...previous, palette };
        applyTheme(next);
        saveTheme(next);
        return next;
      });
    };

    const toggleMode = () => {
      setState((previous) => {
        const next: ThemeState = {
          ...previous,
          mode: previous.mode === "dark" ? "light" : "dark",
        };

        applyTheme(next);
        saveTheme(next);
        return next;
      });
    };

    return {
      mode: state.mode,
      palette: state.palette,
      themeId: toThemeId(state),
      setPalette,
      toggleMode,
    };
  }, [state]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
