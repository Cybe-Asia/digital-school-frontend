"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";
import { useFlag } from "@/components/feature-flags-provider";
import { FLAGS } from "@/shared/feature-flags/flags";

type EOISuccessViewProps = {
  submittedEmail?: string | null;
};

export function EOISuccessView({ submittedEmail }: EOISuccessViewProps) {
  const { t } = useI18n();

  // Feature flag: when enabled in Unleash, hide both "back to form" and
  // "back to login" CTAs so parents focus solely on the check-your-inbox
  // instruction. Default OFF → current behavior (both buttons visible).
  //
  // To flip: https://unleash.cybe.tech:8443/ → toggle `eoi-success-hide-actions`.
  const hideActions = useFlag(
    FLAGS.EoiSuccessHideActions.name,
    FLAGS.EoiSuccessHideActions.default,
  );

  return (
    <div className="rounded-[28px] border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-6 sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.5" />
          <path d="m22 7-10 5L2 7" />
          <path d="M19 16v6" />
          <path d="M16 19h6" />
        </svg>
      </div>

      <div className="mt-5 text-center">
        <h3 className="text-xl font-semibold text-[var(--ds-text-primary)]">{t("auth.eoi.success_page_title")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
          {t("auth.eoi.success_page_description")}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ds-text-primary)]">
          {submittedEmail
            ? t("auth.eoi.success_page_email_hint", { email: submittedEmail })
            : t("auth.eoi.success_page_generic_hint")}
        </p>
      </div>

      {!hideActions ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2" data-testid="eoi-success-actions">
          <Link
            href="/admissions/register"
            className="inline-flex items-center justify-center rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-3 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)] hover:bg-[var(--ds-soft)]"
          >
            {t("auth.eoi.back_to_form")}
          </Link>
          <Link
            href="/admissions/login"
            className="cta-primary inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold"
          >
            {t("auth.eoi.back_to_login")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
