"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePaymentPollingQuery } from "@/features/admissions-auth/presentation/hooks/use-payment";
import { getSetupPaymentHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";

type SetupAccountPaymentReturnProps = {
  paymentId: string;
  /** status=paid|failed from Xendit's redirect — used only as a hint before polling confirms. */
  initialStatusHint?: string;
};

/**
 * Landing page after Xendit's hosted checkout redirects back to us.
 *
 * Polls GET /api/v1/payments/:id every 3s. The payment-service refreshes the
 * status from Xendit on each poll (we can't receive webhooks in dev/test/
 * staging because the host is LAN-only). Once the payment is `paid`, we
 * redirect to the parent dashboard.
 */
export function SetupAccountPaymentReturn({
  paymentId,
  initialStatusHint,
}: SetupAccountPaymentReturnProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { data: payment, isError, error } = usePaymentPollingQuery(paymentId);

  const status = payment?.status;

  useEffect(() => {
    if (status === "paid") {
      // Small delay so the success message is readable before we jump.
      const t = window.setTimeout(() => router.push("/dashboard/parent"), 1200);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [status, router]);

  if (!paymentId) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {t("auth.payment.missing_admission")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {error instanceof Error ? error.message : t("auth.payment.fee_error")}
        </div>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="space-y-3">
        <p className="text-base font-semibold text-[var(--ds-text-primary)]">
          {t("auth.payment.return.paid_title")}
        </p>
        <p className="text-sm text-[var(--ds-text-secondary)]">
          {t("auth.payment.return.paid_description")}
        </p>
      </div>
    );
  }

  if (status === "expired" || status === "failed" || initialStatusHint === "failed") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3">
          <p className="text-sm font-semibold text-[#8b1f1f]">
            {t("auth.payment.return.failed_title")}
          </p>
          <p className="mt-1 text-sm text-[#8b1f1f]">
            {t("auth.payment.return.failed_description")}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            if (payment?.leadId) {
              router.push(getSetupPaymentHref(payment.leadId));
            } else {
              router.refresh();
            }
          }}
        >
          {t("auth.payment.return.retry")}
        </Button>
      </div>
    );
  }

  // Default: still pending — keep polling.
  return (
    <div className="space-y-3">
      <p className="text-base font-semibold text-[var(--ds-text-primary)]">
        {t("auth.payment.return.pending_title")}
      </p>
      <p className="text-sm text-[var(--ds-text-secondary)]">
        {t("auth.payment.return.pending_description")}
      </p>
    </div>
  );
}
