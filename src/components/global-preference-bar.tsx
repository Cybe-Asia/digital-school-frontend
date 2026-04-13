"use client";

import { useState } from "react";
import LanguageToggle from "@/components/language-toggle";
import ThemeToggle from "@/components/theme-toggle";
import { useI18n } from "@/i18n";
import { cn } from "@/shared/lib/cn";

export default function GlobalPreferenceBar() {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();

  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-50 flex justify-end sm:inset-x-4">
      <div
        className={cn(
          "pointer-events-auto inline-flex items-center rounded-[22px] border border-[var(--ds-border)] bg-[color-mix(in_srgb,var(--ds-surface)_88%,transparent)] p-2 shadow-[0_18px_38px_-24px_rgba(16,33,50,0.55)] backdrop-blur transition-[width,box-shadow,background-color] duration-300 ease-out",
          expanded ? "gap-2" : "gap-0",
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls="global-preference-panel"
          aria-label={expanded ? t("common.preferences.hide") : t("common.preferences.show")}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-2 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]/45 hover:bg-[var(--ds-soft)]/40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 7h16M7 12h10M10 17h4" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">{expanded ? t("common.preferences.hide") : t("common.preferences.show")}</span>
        </button>

        <div
          id="global-preference-panel"
          className={cn(
            "grid overflow-hidden transition-all duration-300 ease-out",
            expanded
              ? "ml-2 grid-cols-[1fr] opacity-100"
              : "ml-0 grid-cols-[0fr] opacity-0",
          )}
          aria-hidden={!expanded}
        >
          <div className="min-w-0 overflow-hidden">
            <div
              className={cn(
                "flex items-center gap-2 transition-transform duration-300 ease-out",
                expanded ? "translate-x-0" : "translate-x-3",
              )}
            >
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
