"use client";

import { useState } from "react";
import { useSetupContextQuery } from "@/features/admissions-auth/presentation/hooks/use-setup-context-query";
import {
  useCreateInvoiceMutation,
  useInvoicePreviewQuery,
} from "@/features/admissions-auth/presentation/hooks/use-payment";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { SetupContextSummary } from "./setup-context-summary";

type SetupAccountPaymentFormProps = {
  admissionId: string;
};

/**
 * Step shown right after the parent has submitted their students.
 * Fetches the active FeeStructure for the selected school, then hands off to
 * Xendit's hosted invoice page. Xendit redirects the browser back to
 * /auth/setup-account/payment/return where we poll for the final status.
 */
export function SetupAccountPaymentForm({ admissionId }: SetupAccountPaymentFormProps) {
  const { t } = useI18n();
  const [createError, setCreateError] = useState<string | null>(null);

  const setupContextQuery = useSetupContextQuery(admissionId, Boolean(admissionId));
  const contextSuccess = setupContextQuery.data?.success ? setupContextQuery.data : null;

  // Preview computes the scaled total (unit fee × students) directly from
  // the backend, so the UI can never disagree with what Xendit charges.
  const previewQuery = useInvoicePreviewQuery(admissionId, "application_fee", Boolean(contextSuccess));
  const createInvoice = useCreateInvoiceMutation();

  if (!admissionId) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {t("auth.payment.missing_admission")}
      </div>
    );
  }

  const onPay = async () => {
    setCreateError(null);
    try {
      const result = await createInvoice.mutateAsync({
        admissionId,
        paymentType: "application_fee",
      });
      // Jump to Xendit's hosted checkout. On completion Xendit sends the
      // browser back to /auth/setup-account/payment/return?paymentId=...
      window.location.href = result.hostedInvoiceUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCreateError(msg);
    }
  };

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-5">
      {setupContextQuery.isLoading ? (
        <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.setup.loading_context")}</p>
      ) : null}

      {contextSuccess ? <SetupContextSummary context={contextSuccess.context} /> : null}

      {previewQuery.isLoading ? (
        <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.payment.loading_fee")}</p>
      ) : null}

      {previewQuery.isError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t("auth.payment.fee_error")}
        </div>
      ) : null}

      {previewQuery.data ? (
        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.payment.school_label")}</p>
              <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
                {previewQuery.data.schoolCode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.payment.fee_label")}</p>
              <p className="text-sm text-[var(--ds-text-secondary)]">
                {formatAmount(previewQuery.data.unitAmount, previewQuery.data.currency)}
                {" × "}
                {previewQuery.data.studentCount}
                {" "}
                {previewQuery.data.studentCount === 1
                  ? t("auth.payment.student_singular")
                  : t("auth.payment.student_plural")}
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--ds-text-primary)]">
                {formatAmount(previewQuery.data.total, previewQuery.data.currency)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {createError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t("auth.payment.create_error")}
        </div>
      ) : null}

      <Button
        type="button"
        className="w-full"
        disabled={!previewQuery.data || previewQuery.data.studentCount === 0 || createInvoice.isPending}
        onClick={onPay}
      >
        {createInvoice.isPending ? t("auth.payment.pay_loading") : t("auth.payment.pay_button")}
      </Button>
    </div>
  );
}
