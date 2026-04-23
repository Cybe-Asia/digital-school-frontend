import Link from "next/link";
import { getServerI18n } from "@/i18n/server";
import { Card } from "@/shared/ui/card";
import type { ReactNode } from "react";
import { AuthShellEffects } from "./auth-shell-effects";
import { StepIndicator, type Step } from "@/components/ui/step-indicator";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerPrompt?: string;
  footerLinkLabel?: string;
  footerHref?: string;
  /**
   * Optional setup-account progress indicator. Provide the list of step
   * labels (already translated) and the zero-based active index. When set,
   * the step strip renders above the title so parents always know how far
   * through onboarding they are. Design principle #9.
   */
  stepIndicator?: {
    steps: Step[];
    currentIndex: number;
    summaryLabel?: string;
  };
};

export async function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerPrompt,
  footerLinkLabel,
  footerHref,
  stepIndicator,
}: AuthShellProps) {
  const { t } = await getServerI18n();

  return (
    <div className="auth-shell min-h-screen">
      <AuthShellEffects />
      <div className="auth-orb auth-orb-a" aria-hidden="true" />
      <div className="auth-orb auth-orb-b" aria-hidden="true" />
      <div className="auth-orb auth-orb-c" aria-hidden="true" />
      <main className="mx-auto grid min-h-screen w-full max-w-[780px] min-w-0 px-4 py-6 sm:px-6 sm:py-10">
        <Card className="auth-panel relative my-auto w-full min-w-0 overflow-hidden rounded-[32px] p-6 sm:p-9">
          {/* Brand masthead — emblem + wordmark gives the shell a real
              "product" feel instead of a thin line of uppercase text. */}
          <div className="mb-7 flex items-center justify-between gap-4 border-b border-[var(--ds-border)]/60 pb-5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--ds-primary)] to-[var(--ds-cta-fill-2)] text-[var(--ds-on-primary)] shadow-[0_10px_24px_-14px_rgba(11,110,79,0.55)]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ds-primary)]">
                  {t("common.brand.cybe")}
                </p>
                <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">Parent onboarding</p>
              </div>
            </div>
          </div>

          {stepIndicator ? (
            <div className="mb-6">
              <StepIndicator
                steps={stepIndicator.steps}
                currentIndex={stepIndicator.currentIndex}
                summaryLabel={stepIndicator.summaryLabel}
              />
            </div>
          ) : null}

          <span className="eyebrow-chip">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-primary)]" aria-hidden="true" />
            {t(eyebrow)}
          </span>
          <h2 className="mt-4 text-[1.6rem] font-semibold leading-[1.15] tracking-tight text-[var(--ds-text-primary)] sm:text-[1.95rem]">{t(title)}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--ds-text-secondary)]">{t(description)}</p>
          <div className="mt-6 sm:mt-7">{children}</div>
          {footerPrompt && footerLinkLabel && footerHref ? (
            <p className="mt-7 border-t border-[var(--ds-border)]/60 pt-5 text-center text-sm leading-relaxed text-[var(--ds-text-secondary)] sm:mt-9">
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
