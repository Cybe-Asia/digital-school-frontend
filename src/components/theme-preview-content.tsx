"use client";

import { useEffect } from "react";
import { paletteOptions, type ThemeId } from "@/components/theme-config";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type ThemePreviewContentProps = {
  themeId: ThemeId;
};

const swatches = [
  { labelKey: "theme_lab.swatches.primary", value: "var(--ds-primary)" },
  { labelKey: "theme_lab.swatches.secondary", value: "var(--ds-secondary)" },
  { labelKey: "theme_lab.swatches.accent", value: "var(--ds-accent)" },
  { labelKey: "theme_lab.swatches.highlight", value: "var(--ds-highlight)" },
];

export default function ThemePreviewContent({ themeId }: ThemePreviewContentProps) {
  const { t } = useI18n();
  const [palette, mode] = themeId.split("-") as [typeof paletteOptions[number]["id"], "light" | "dark"];
  const paletteLabel = t(`theme.options.${palette}`);
  const modeLabel = t(mode === "dark" ? "common.theme.dark_mode" : "common.theme.light_mode");

  useEffect(() => {
    const previousTheme = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = themeId;

    return () => {
      if (previousTheme) {
        document.documentElement.dataset.theme = previousTheme;
        return;
      }

      delete document.documentElement.dataset.theme;
    };
  }, [themeId]);

  return (
    <div className="dashboard-bg min-h-screen p-4">
      <div className="mx-auto max-w-[680px] space-y-4">
        <Card className="brand-header rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">
            {t("theme_gallery.preview_eyebrow")}
          </p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">{paletteLabel}</h1>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{modeLabel}</p>
        </Card>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {swatches.map((swatch) => (
            <Card key={swatch.labelKey} className="space-y-3 rounded-2xl p-4">
              <div className="h-16 rounded-2xl" style={{ backgroundColor: swatch.value }} aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t(swatch.labelKey)}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-4 rounded-3xl p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
                {t("theme_lab.admissions_preview.eyebrow")}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">{t("theme_lab.admissions_preview.title")}</h2>
            </div>
            <div className="space-y-3">
              <div className="field-input rounded-2xl px-4 py-3 text-sm text-[var(--ds-text-secondary)]">
                {t("theme_lab.admissions_preview.email_placeholder")}
              </div>
              <div className="field-select rounded-2xl px-4 py-3 text-sm text-[var(--ds-text-secondary)]">
                {t("theme_lab.admissions_preview.school_placeholder")}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>{t("theme_lab.admissions_preview.primary_action")}</Button>
              <Button variant="secondary">{t("theme_lab.admissions_preview.secondary_action")}</Button>
            </div>
          </Card>

          <Card className="space-y-4 rounded-3xl p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
                {t("theme_lab.dashboard_preview.eyebrow")}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">{t("theme_lab.dashboard_preview.title")}</h2>
            </div>
            <div className="hero-panel rounded-3xl p-5">
              <p className="text-sm text-[var(--ds-text-secondary)]">{t("theme_lab.dashboard_preview.description")}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-card rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("dashboard.parent.metrics.linked_students.label")}</p>
                <p className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">2</p>
              </div>
              <div className="surface-card rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("dashboard.parent.metrics.average_attendance.label")}</p>
                <p className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">92%</p>
              </div>
              <div className="surface-card rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("dashboard.parent.metrics.tuition_due.label")}</p>
                <p className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">Rp 2.400.000</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
