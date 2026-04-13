"use client";

import LanguageToggle from "@/components/language-toggle";
import { paletteOptions, type ThemePalette } from "@/components/theme-config";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/i18n";
import { Select } from "@/shared/ui/select";

export function ThemeLabControls() {
  const palette = useTheme((state) => state.palette);
  const mode = useTheme((state) => state.mode);
  const setPalette = useTheme((state) => state.setPalette);
  const setMode = useTheme((state) => state.setMode);
  const { t } = useI18n();
  const activeThemeLabel = `${t(`theme.options.${palette}`)} · ${t(
    mode === "dark" ? "common.theme.dark_mode" : "common.theme.light_mode",
  )}`;

  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-[var(--ds-border)] bg-[var(--ds-surface)]/90 p-3 shadow-[var(--ds-shadow-soft)] md:min-w-[420px]">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
          {t("theme_picker.eyebrow")}
        </p>
        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{activeThemeLabel}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto] md:items-end">
        <div>
          <label htmlFor="palette-select" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
            {t("theme_picker.palette_label")}
          </label>
          <Select
            id="palette-select"
            value={palette}
            className="theme-select rounded-2xl py-3"
            onChange={(event) => setPalette(event.target.value as ThemePalette)}
          >
            {paletteOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {t(`theme.options.${option.id}`)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="mode-select" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
            {t("theme_picker.mode_label")}
          </label>
          <Select
            id="mode-select"
            value={mode}
            className="rounded-2xl py-3"
            onChange={(event) => setMode(event.target.value as "light" | "dark")}
          >
            <option value="light">{t("common.theme.light_mode")}</option>
            <option value="dark">{t("common.theme.dark_mode")}</option>
          </Select>
        </div>

        <div className="flex items-center gap-2 md:justify-end">
          <span className="h-3 w-3 rounded-full border border-white/40 bg-[var(--ds-primary)]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full border border-white/40 bg-[var(--ds-secondary)]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full border border-white/40 bg-[var(--ds-accent)]" aria-hidden="true" />
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
