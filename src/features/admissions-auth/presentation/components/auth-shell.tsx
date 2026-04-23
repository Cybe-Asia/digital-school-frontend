import Link from "next/link";
import type { ReactNode } from "react";
import { getServerI18n } from "@/i18n/server";
import { StepIndicator, type Step } from "@/components/ui/step-indicator";
import { HeartIcon } from "@/components/parent-ui/icons";

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
   * labels (already translated) and the zero-based active index. When
   * set, the strip renders as a slim progress bar above the title so
   * parents always know how far through onboarding they are.
   */
  stepIndicator?: {
    steps: Step[];
    currentIndex: number;
    summaryLabel?: string;
  };
};

/**
 * <AuthShell> — rewritten 2026. Swap the floating-orb gradient panel
 * for a calm cream canvas + one centered white panel. Big serif title,
 * soft rounded shape, a single-purpose feel. Used for login, setup-
 * account, password-reset, and every OTP/method/additional step.
 */
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
    <div className="parent-auth-canvas">
      <div className="parent-auth-panel">
        {/* Brand lockup — no 11px uppercase kicker, no tagline. One
            line, one dot, one emblem. Keeps the panel feeling warm. */}
        <div className="mb-6 flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white"
            aria-hidden="true"
          >
            <span className="h-4 w-4">
              <HeartIcon />
            </span>
          </span>
          <div>
            <p className="parent-text-serif text-[17px] text-[color:var(--ink-900)]">
              {t("common.brand.cybe")}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-400)]">
              {t("parent.auth.setup.brand_tag")}
            </p>
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

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
          {t(eyebrow)}
        </p>
        <h1 className="parent-text-serif mt-2 text-[clamp(28px,5vw,34px)] leading-[1.1] text-[color:var(--ink-900)]">
          {t(title)}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
          {t(description)}
        </p>

        <div className="mt-6">{children}</div>

        {footerPrompt && footerLinkLabel && footerHref ? (
          <p className="mt-8 border-t border-[color:var(--line)] pt-5 text-center text-sm text-[color:var(--ink-500)]">
            {t(footerPrompt)}{" "}
            <Link
              href={footerHref}
              className="font-semibold text-[color:var(--brand-strong)] underline underline-offset-2"
            >
              {t(footerLinkLabel)}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
