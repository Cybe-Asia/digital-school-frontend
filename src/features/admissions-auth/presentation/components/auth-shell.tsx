"use client";

import Link from "next/link";
import LanguageToggle from "@/components/language-toggle";
import { ThemeModeToggle } from "@/features/admissions-auth/presentation/components/theme-mode-toggle";
import { useI18n } from "@/i18n";
import { Card } from "@/shared/ui/card";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerPrompt?: string;
  footerLinkLabel?: string;
  footerHref?: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerPrompt,
  footerLinkLabel,
  footerHref,
}: AuthShellProps) {
  const { t } = useI18n();

  return (
    <div className="auth-shell min-h-screen">
      <div className="auth-orb auth-orb-a" aria-hidden="true" />
      <div className="auth-orb auth-orb-b" aria-hidden="true" />
      <main className="mx-auto grid min-h-screen w-full max-w-[760px] min-w-0 px-4 py-4 sm:px-6 sm:py-8">
        <Card className="auth-panel my-auto w-full min-w-0 rounded-[28px] p-5 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ds-primary)]">
                {t("common.brand.cybe")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageToggle />
              <ThemeModeToggle />
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">{t(eyebrow)}</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)] sm:text-2xl">{t(title)}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(description)}</p>
          <div className="mt-5 sm:mt-6">{children}</div>
          {footerPrompt && footerLinkLabel && footerHref ? (
            <p className="mt-6 text-center text-sm leading-relaxed text-[var(--ds-text-secondary)] sm:mt-8">
              {t(footerPrompt)}{" "}
              <Link href={footerHref} className="font-semibold text-[var(--ds-primary)] hover:text-[var(--ds-cta-fill-2)]">
                {t(footerLinkLabel)}
              </Link>
            </p>
          ) : null}
        </Card>
      </main>
    </div>
  );
}
