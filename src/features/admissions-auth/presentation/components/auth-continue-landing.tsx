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
  // Missing-params is a synchronous derived state — don't setState in
  // effect for it (that triggers a cascading render and lint-errors in CI).
  const missingParams = !token || !admissionId;
  const [asyncError, setAsyncError] = useState<string | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (missingParams) return;
    firedRef.current = true;

    (async () => {
      const ok = await setSession(token);
      if (!ok) {
        setAsyncError(t("auth.continue.session_failed"));
        return;
      }
      router.replace(getSetupAdditionalFormHref(admissionId));
    })();
  }, [token, admissionId, router, t, missingParams]);

  const error = missingParams ? t("auth.continue.missing_params") : asyncError;

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
