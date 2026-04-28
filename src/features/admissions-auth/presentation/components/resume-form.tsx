"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { getServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { FormField } from "./form-field";

/**
 * Minimal email-only form that POSTs to /resend-verification. The
 * backend always returns 200 (anti-enumeration), so the success copy
 * is shown unconditionally on a non-network response. Parents whose
 * email isn't in the system get the same "check your inbox" message
 * — they'll just never receive an email, which matches the
 * confidential-by-default UX.
 */
export function ResumeForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNetworkError(null);
    if (!email.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      const url = `${getServiceEndpoints().admission}/resend-verification`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        credentials: "same-origin",
      });
      if (!response.ok) {
        // Backend always 200s — a non-OK here is a real infra
        // problem worth surfacing.
        setNetworkError(t("api.error.unable_to_process"));
        return;
      }
      setDone(true);
    } catch {
      setNetworkError(t("api.error.network"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-6 text-sm text-[var(--ds-text-primary)]">
        <p className="font-semibold">{t("auth.resume.success_title")}</p>
        <p className="mt-2 text-[var(--ds-text-secondary)]">
          {t("auth.resume.success_body", { email })}
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {networkError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {networkError}
        </div>
      ) : null}

      <FormField label="auth.resume.email_label" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.resume.email_placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? t("auth.resume.submit_loading") : t("auth.resume.submit")}
      </Button>
    </form>
  );
}
