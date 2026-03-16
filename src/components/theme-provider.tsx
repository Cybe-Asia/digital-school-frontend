"use client";

import { useEffect, type ReactNode } from "react";
import { create } from "zustand";

export type ThemeMode = "light" | "dark";
export type ThemePalette = "option1" | "option2" | "option3" | "option4" | "option5";
export type ThemeId = `${ThemePalette}-${ThemeMode}`;

type ThemeState = {
  hydrated: boolean;
  palette: ThemePalette;
  mode: ThemeMode;
  themeId: ThemeId;
  hydrate: () => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPalette: (palette: ThemePalette) => void;
};

const STORAGE_KEY = "ds-theme-id";
const DEFAULT_PALETTE: ThemePalette = "option2";
const DEFAULT_MODE: ThemeMode = "light";
const DEFAULT_THEME_ID: ThemeId = `${DEFAULT_PALETTE}-${DEFAULT_MODE}`;

export const paletteOptions: Array<{ id: ThemePalette; label: string }> = [
  { id: "option1", label: "Option 1 · Modern Islamic Minimal" },
  { id: "option2", label: "Option 2 · Contemporary Education Tech" },
  { id: "option3", label: "Option 3 · Heritage Meets Future" },
  { id: "option4", label: "Option 4 · Clean Academic White" },
  { id: "option5", label: "Option 5 · Youth Islamic Contemporary" },
];

function toThemeId(palette: ThemePalette, mode: ThemeMode): ThemeId {
  return `${palette}-${mode}`;
}

function detectSystemMode(): ThemeMode {
  if (typeof window === "undefined") {
    return DEFAULT_MODE;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function parseThemeId(value: string | null | undefined): ThemeId | null {
  if (!value) {
    return null;
  }

  const match = /^(option[1-5])-(light|dark)$/.exec(value);

  if (!match) {
    return null;
  }

  return `${match[1] as ThemePalette}-${match[2] as ThemeMode}`;
}

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

function saveThemeId(themeId: ThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    // Ignore blocked storage.
  }
}

function getInitialThemeId(): ThemeId {
  if (typeof document === "undefined") {
    return DEFAULT_THEME_ID;
  }

  const fromDom = parseThemeId(document.documentElement.dataset.theme);
  if (fromDom) {
    return fromDom;
  }

  const fromStorage = readStoredThemeId();
  if (fromStorage) {
    return fromStorage;
  }

  return toThemeId(DEFAULT_PALETTE, detectSystemMode());
}

function splitThemeId(themeId: ThemeId): { palette: ThemePalette; mode: ThemeMode } {
  const [palette, mode] = themeId.split("-") as [ThemePalette, ThemeMode];
  return { palette, mode };
}

export const useTheme = create<ThemeState>((set, get) => {
  const initialThemeId = getInitialThemeId();
  const initialState = splitThemeId(initialThemeId);

  return {
    hydrated: false,
    palette: initialState.palette,
    mode: initialState.mode,
    themeId: initialThemeId,
    hydrate: () => {
      const storedThemeId = readStoredThemeId();
      const themeId = storedThemeId ?? parseThemeId(document.documentElement.dataset.theme) ?? DEFAULT_THEME_ID;
      const nextState = splitThemeId(themeId);

      applyTheme(themeId);

      set({
        hydrated: true,
        palette: nextState.palette,
        mode: nextState.mode,
        themeId,
      });
    },
    setMode: (mode) => {
      const { palette } = get();
      const themeId = toThemeId(palette, mode);
      applyTheme(themeId);
      saveThemeId(themeId);
      set({ mode, themeId });
    },
    toggleMode: () => {
      const { mode, setMode } = get();
      setMode(mode === "dark" ? "light" : "dark");
    },
    setPalette: (palette) => {
      const { mode } = get();
      const themeId = toThemeId(palette, mode);
      applyTheme(themeId);
      saveThemeId(themeId);
      set({ palette, themeId });
    },
  };
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const hydrate = useTheme((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return children;
}
