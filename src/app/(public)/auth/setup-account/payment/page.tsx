import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountPaymentForm } from "@/features/admissions-auth/presentation/components/setup-account-payment-form";
import { getSetupAdmissionIdFromSearchParams } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { buildSetupStepIndicator } from "@/features/admissions-auth/presentation/lib/setup-account-steps";
import { getSingleSearchParam } from "@/shared/lib/search-params";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pay fee",
    description: "Complete your admission payment.",
  };
}

type SetupAccountPaymentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * One page serves two flows:
 *   - Registration (default): `?admissionId=LEAD-xxx`
 *       → paymentType=application_fee, charged per student
 *   - Enrolment: `?admissionId=STU-xxx&paymentType=enrolment_fee`
 *       → charged once per student after Offer accepted
 *
 * The backend resolves either a Lead id or a Student id via its
 * admissionId param because both paths funnel through the same
 * create-invoice handler.
 */
export default async function SetupAccountPaymentPage({ searchParams }: SetupAccountPaymentPageProps) {
  const sp = await searchParams;
  const admissionId = getSetupAdmissionIdFromSearchParams(sp);
  const paymentType =
    getSingleSearchParam(sp.paymentType) ?? "application_fee";
  const { t } = await getServerI18n();

  return (
    <AuthShell
      eyebrow="auth.payment.eyebrow"
      title="auth.payment.title"
      description="auth.payment.description"
      stepIndicator={buildSetupStepIndicator(t, "payment")}
    >
      <SetupAccountPaymentForm admissionId={admissionId} paymentType={paymentType} />
    </AuthShell>
  );
}
