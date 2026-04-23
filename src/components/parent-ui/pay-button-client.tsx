"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { useCreateInvoiceMutation } from "@/features/admissions-auth/presentation/hooks/use-payment";
import { BigButton } from "./big-button";

type PayButtonClientProps = {
  /** Existing Xendit hostedInvoiceUrl if the invoice is already issued. */
  existingInvoiceUrl?: string | null;
  /** Lead admission id (LEAD-*) — the payment-service uses this to
   *  look up the active FeeStructure + create the Xendit invoice. */
  admissionId: string;
  /** Fallback payment-type string. Defaults to application_fee. */
  paymentType?: string;
};

/**
 * Parent-facing "Bayar sekarang" button. Two behaviours:
 *
 * 1. If the backend already has a hostedInvoiceUrl for this kid
 *    (Xendit invoice was created earlier), clicking jumps straight
 *    to Xendit checkout. No round-trip to payment-service.
 *
 * 2. If there is no invoice yet, clicking calls the real payment-
 *    service via `useCreateInvoiceMutation` (POST /invoice with
 *    admissionId + paymentType). Payment-service issues the Xendit
 *    invoice, returns the hostedInvoiceUrl, and we open it in a
 *    new tab.
 *
 * Either way the parent ends up on Xendit; the frontend never
 * completes a payment on its own.
 */
export function PayButtonClient({
  existingInvoiceUrl,
  admissionId,
  paymentType = "application_fee",
}: PayButtonClientProps) {
  const { t } = useI18n();
  const createInvoice = useCreateInvoiceMutation();
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);

    if (existingInvoiceUrl) {
      window.open(existingInvoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const result = await createInvoice.mutateAsync({ admissionId, paymentType });
      if (!result.hostedInvoiceUrl) {
        setError(t("parent.payments.xendit_missing_url"));
        return;
      }
      window.open(result.hostedInvoiceUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const isPending = createInvoice.isPending;

  return (
    <div>
      <BigButton onClick={onClick} disabled={isPending}>
        {isPending ? t("parent.payments.pay_loading") : t("parent.payments.pay_cta")}
      </BigButton>
      {error ? (
        <p className="mt-3 text-sm text-[color:var(--warm-coral,#c24d4d)]" role="alert">
          {t("parent.payments.xendit_error", { reason: error })}
        </p>
      ) : null}
    </div>
  );
}
