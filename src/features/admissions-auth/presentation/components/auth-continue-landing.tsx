"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { setSession } from "@/features/admissions-auth/infrastructure/session-api";
import { getSetupAdditionalFormHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { useI18n } from "@/i18n";

type AuthContinueLandingProps = {
  token: string;
  admissionId: string;
};

/**
 * Client-side half of the magic-link flow. Exchanges the email-link JWT
 * for an HttpOnly session cookie, then hops to the students form for the
 * admissionId (new Lead) the parent is about to fill in.
 *
 * Fire-once guard: strict-mode double-renders in dev would otherwise try
 * to POST the session twice.
 */
export function AuthContinueLanding({ token, admissionId }: AuthContinueLandingProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (!token || !admissionId) {
      setError(t("auth.continue.missing_params"));
      return;
    }
    firedRef.current = true;

    (async () => {
      const ok = await setSession(token);
      if (!ok) {
        setError(t("auth.continue.session_failed"));
        return;
      }
      router.replace(getSetupAdditionalFormHref(admissionId));
    })();
  }, [token, admissionId, router, t]);

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {error}
        </div>
      </div>
    );
  }

  // Success path is silent — we redirect before React paints anything
  // beyond this "checking" state.
  return (
    <p className="text-sm text-[var(--ds-text-secondary)]">
      {t("auth.continue.checking")}
    </p>
  );
}
