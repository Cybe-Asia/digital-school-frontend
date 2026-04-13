"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";

type GoogleCallbackContentProps = {
  error?: string;
  returnTo?: string;
};

export function GoogleCallbackContent({ error, returnTo }: GoogleCallbackContentProps) {
  const { t } = useI18n();

  if (error) {
    return (
      <main className="dashboard-bg flex min-h-screen items-center justify-center px-4">
        <div className="surface-card w-full max-w-[560px] rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">{t("auth.google.eyebrow")}</p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--ds-text-primary)]">{t("auth.google.failure_title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(error)}</p>
          <Link href="/admissions/login" className="mt-5 inline-flex text-sm font-semibold text-[var(--ds-primary)]">
            {t("auth.google.back_to_login")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-bg flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-[560px] rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">{t("auth.google.eyebrow")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--ds-text-primary)]">{t("auth.google.success_title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
          {t("auth.google.success_description")}
        </p>
        <Link href={returnTo || "/dashboard/parent"} className="mt-5 inline-flex text-sm font-semibold text-[var(--ds-primary)]">
          {t("common.actions.continue")}
        </Link>
      </div>
    </main>
  );
}
