"use client";

import { ThemeLabControls } from "@/features/admissions-auth/presentation/components/theme-lab-controls";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

const swatches = [
  { labelKey: "theme_lab.swatches.primary", value: "var(--ds-primary)" },
  { labelKey: "theme_lab.swatches.secondary", value: "var(--ds-secondary)" },
  { labelKey: "theme_lab.swatches.accent", value: "var(--ds-accent)" },
  { labelKey: "theme_lab.swatches.highlight", value: "var(--ds-highlight)" },
];

export default function ThemeLabPageContent() {
  const { t } = useI18n();

  return (
    <div className="dashboard-bg min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1240px] space-y-6">
        <Card className="brand-header">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ds-primary)]">
                {t("theme_lab.eyebrow")}
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)] sm:text-3xl">{t("theme_lab.title")}</h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--ds-text-secondary)]">
                {t("theme_lab.description")}
              </p>
            </div>
            <ThemeLabControls />
          </div>
        </Card>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {swatches.map((swatch) => (
            <Card key={swatch.labelKey} className="space-y-4 p-5">
              <div className="h-20 rounded-2xl sm:h-24" style={{ backgroundColor: swatch.value }} aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(swatch.labelKey)}</p>
                <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">{swatch.value}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
                {t("theme_lab.admissions_preview.eyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">{t("theme_lab.admissions_preview.title")}</h2>
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

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
                {t("theme_lab.dashboard_preview.eyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">{t("theme_lab.dashboard_preview.title")}</h2>
            </div>
            <div className="hero-panel rounded-3xl p-5">
              <p className="text-sm text-[var(--ds-text-secondary)]">{t("theme_lab.dashboard_preview.description")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="status-pill status-positive">{t("common.status.on_track")}</span>
              <span className="status-pill status-neutral">{t("common.status.pending")}</span>
              <span className="status-pill status-negative">{t("common.status.needs_review")}</span>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
