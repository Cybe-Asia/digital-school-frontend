import type { Metadata } from "next";
import { ThemeLabControls } from "@/features/admissions-auth/presentation/components/theme-lab-controls";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

export const metadata: Metadata = {
  title: "Theme Lab | Cybe Digital School",
  description: "Internal theme preview page for admissions and dashboard styling.",
};

const swatches = [
  { label: "Primary", value: "var(--ds-primary)" },
  { label: "Secondary", value: "var(--ds-secondary)" },
  { label: "Accent", value: "var(--ds-accent)" },
  { label: "Highlight", value: "var(--ds-highlight)" },
];

export default function ThemeLabPage() {
  return (
    <div className="dashboard-bg min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1240px] space-y-6">
        <Card className="brand-header">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ds-primary)]">
                Internal Theme Lab
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)] sm:text-3xl">Palette preview and QA controls</h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--ds-text-secondary)]">
                This route preserves the full branding palette system while public admissions screens stay locked to Option 2 with light and dark mode.
              </p>
            </div>
            <ThemeLabControls />
          </div>
        </Card>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {swatches.map((swatch) => (
            <Card key={swatch.label} className="space-y-4 p-5">
              <div className="h-20 rounded-2xl sm:h-24" style={{ backgroundColor: swatch.value }} aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{swatch.label}</p>
                <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">{swatch.value}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
                Admissions Preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">Form treatment and CTA states</h2>
            </div>
            <div className="space-y-3">
              <div className="field-input rounded-2xl px-4 py-3 text-sm text-[var(--ds-text-secondary)]">Email address</div>
              <div className="field-select rounded-2xl px-4 py-3 text-sm text-[var(--ds-text-secondary)]">School selection</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Primary action</Button>
              <Button variant="secondary">Secondary action</Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
                Dashboard Preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">Surface, hero, and status tokens</h2>
            </div>
            <div className="hero-panel rounded-3xl p-5">
              <p className="text-sm text-[var(--ds-text-secondary)]">Admissions and dashboards continue to share the same token source.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="status-pill status-positive">On track</span>
              <span className="status-pill status-neutral">Pending</span>
              <span className="status-pill status-negative">Needs review</span>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
