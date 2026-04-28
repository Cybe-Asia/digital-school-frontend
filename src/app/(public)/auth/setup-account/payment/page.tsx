import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountPaymentForm } from "@/features/admissions-auth/presentation/components/setup-account-payment-form";
import { getSetupAdmissionIdFromSearchParams } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { buildSetupStepIndicator } from "@/features/admissions-auth/presentation/lib/setup-account-steps";
import { requireSetupStep } from "@/features/admissions-auth/presentation/lib/wizard-guard";
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

  // Wizard guard: parent must have submitted their students first.
  // Visiting this page at any earlier step kicks them back to the
  // canonical page for their actual step. We skip the guard for the
  // enrolment-fee variant — that flow is reached from the offer
  // dashboard with a Student id, not a Lead id, so the setup_step
  // state machine doesn't apply.
  if (paymentType === "application_fee") {
    await requireSetupStep(admissionId, "students_added");
  }

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
