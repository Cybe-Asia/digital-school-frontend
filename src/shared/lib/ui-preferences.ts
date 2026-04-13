import type { ThemeId, ThemeMode, ThemePalette } from "@/components/theme-config";

export type LanguageCode = "en" | "id";

export const LANGUAGE_COOKIE_NAME = "ds-language";
export const THEME_COOKIE_NAME = "ds-theme-id";

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const DEFAULT_THEME_PALETTE: ThemePalette = "option2";
export const DEFAULT_THEME_MODE: ThemeMode = "light";
export const DEFAULT_THEME_ID: ThemeId = `${DEFAULT_THEME_PALETTE}-${DEFAULT_THEME_MODE}`;

export function parseLanguage(value: string | null | undefined): LanguageCode | null {
  if (value === "en" || value === "id") {
    return value;
  }

  return null;
}

export function parseThemeId(value: string | null | undefined): ThemeId | null {
  if (!value) {
    return null;
  }

  const match = /^(option[1-5])-(light|dark)$/.exec(value);

  if (!match) {
    return null;
  }

  return `${match[1] as ThemePalette}-${match[2] as ThemeMode}`;
}

export function splitThemeId(themeId: ThemeId): { palette: ThemePalette; mode: ThemeMode } {
  const [palette, mode] = themeId.split("-") as [ThemePalette, ThemeMode];
  return { palette, mode };
}

export function toThemeId(palette: ThemePalette, mode: ThemeMode): ThemeId {
  return `${palette}-${mode}`;
}
