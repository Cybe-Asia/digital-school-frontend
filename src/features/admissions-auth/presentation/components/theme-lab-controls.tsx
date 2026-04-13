"use client";

import LanguageToggle from "@/components/language-toggle";
import { paletteOptions, useTheme, type ThemePalette } from "@/components/theme-provider";
import { ThemeModeToggle } from "@/features/admissions-auth/presentation/components/theme-mode-toggle";
import { useI18n } from "@/i18n";
import { Select } from "@/shared/ui/select";

export function ThemeLabControls() {
  const palette = useTheme((state) => state.palette);
  const setPalette = useTheme((state) => state.setPalette);
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="palette-select" className="sr-only">
        {t("common.select_branding_option")}
      </label>
      <Select
        id="palette-select"
        value={palette}
        className="min-w-64 rounded-full py-2"
        onChange={(event) => setPalette(event.target.value as ThemePalette)}
      >
        {paletteOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {t(`theme.options.${option.id}`)}
          </option>
        ))}
      </Select>
      <LanguageToggle />
      <ThemeModeToggle />
    </div>
  );
}
