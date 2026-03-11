"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSetupContextQuery } from "@/features/admissions-auth/presentation/hooks/use-setup-context-query";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { SetupContextSummary } from "./setup-context-summary";

export function SetupAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const { t } = useI18n();

  const setupContextQuery = useSetupContextQuery(tokenFromUrl);
  const contextSuccess = setupContextQuery.data?.success ? setupContextQuery.data : null;
  const contextFailure = setupContextQuery.data && !setupContextQuery.data.success ? setupContextQuery.data : null;

  if (!tokenFromUrl) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {t("auth.setup.missing_token")}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {setupContextQuery.isLoading ? <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.setup.loading_context")}</p> : null}

      {contextFailure?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t(contextFailure.formError)}
        </div>
      ) : null}

      {contextSuccess ? <SetupContextSummary context={contextSuccess.context} /> : null}

      {contextSuccess ? (
        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t("auth.setup.start_title")}</p>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t("auth.setup.start_hint")}</p>
          <Button
            className="mt-4 w-full"
            onClick={() => router.push(`/auth/setup-account/otp?token=${encodeURIComponent(tokenFromUrl)}`)}
          >
            {t("auth.setup.send_otp")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
