"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";

type VerificationErrorStateProps = {
  variant: "missing-token" | "empty-admission" | "token-expired" | "network-error" | "verify-failed";
  onRetry?: () => void;
  isRetrying?: boolean;
};

const ICON_MAP = {
  "missing-token": MissingTokenIcon,
  "empty-admission": EmptyAdmissionIcon,
  "token-expired": TokenExpiredIcon,
  "network-error": NetworkErrorIcon,
  "verify-failed": VerifyFailedIcon,
} as const;

const TITLE_KEY_MAP: Record<VerificationErrorStateProps["variant"], string> = {
  "missing-token": "auth.verification.error.missing_token_title",
  "empty-admission": "auth.verification.error.empty_admission_title",
  "token-expired": "auth.verification.error.token_expired_title",
  "network-error": "auth.verification.error.network_error_title",
  "verify-failed": "auth.verification.error.verify_failed_title",
};

const DESCRIPTION_KEY_MAP: Record<VerificationErrorStateProps["variant"], string> = {
  "missing-token": "auth.verification.error.missing_token_description",
  "empty-admission": "auth.verification.error.empty_admission_description",
  "token-expired": "auth.verification.error.token_expired_description",
  "network-error": "auth.verification.error.network_error_description",
  "verify-failed": "auth.verification.error.verify_failed_description",
};

export function VerificationErrorState({ variant, onRetry, isRetrying }: VerificationErrorStateProps) {
  const { t } = useI18n();
  const Icon = ICON_MAP[variant];
  const canRetry = variant === "network-error" || variant === "verify-failed";

  return (
    <div className="rounded-[28px] border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-8 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fee9e9] text-[#b42318]">
          <Icon />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-[var(--ds-text-primary)]">
          {t(TITLE_KEY_MAP[variant])}
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--ds-text-secondary)]">
          {t(DESCRIPTION_KEY_MAP[variant])}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {canRetry && onRetry ? (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-3 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)] hover:bg-[var(--ds-soft)] disabled:opacity-50"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? t("auth.verification.error.retrying") : t("auth.verification.error.retry")}
          </button>
        ) : (
          <Link
            href="/admissions/register"
            className="inline-flex items-center justify-center rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-3 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)] hover:bg-[var(--ds-soft)]"
          >
            {t("auth.verification.error.back_to_register")}
          </Link>
        )}

        <Link
          href="/admissions/login"
          className="cta-primary inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          {t("auth.verification.error.back_to_login")}
        </Link>
      </div>
    </div>
  );
}

function MissingTokenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m14.5 12.5-5 5" />
      <path d="m9.5 12.5 5 5" />
    </svg>
  );
}

function EmptyAdmissionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" x2="22" y1="11" y2="11" />
    </svg>
  );
}

function TokenExpiredIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <line x1="4" x2="20" y1="4" y2="20" />
    </svg>
  );
}

function NetworkErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.01 16.5h.005" />
      <path d="M16.5 13a5 5 0 0 0-9 0" />
      <path d="M20 10a9 9 0 0 0-18 0" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function VerifyFailedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </svg>
  );
}
