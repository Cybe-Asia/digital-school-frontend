import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountPaymentForm } from "@/features/admissions-auth/presentation/components/setup-account-payment-form";
import { getSetupAdmissionIdFromSearchParams } from "@/features/admissions-auth/presentation/lib/setup-account-routes";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pay registration fee",
    description: "Complete your admission by paying the registration fee.",
  };
}

type SetupAccountPaymentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SetupAccountPaymentPage({ searchParams }: SetupAccountPaymentPageProps) {
  const admissionId = getSetupAdmissionIdFromSearchParams(await searchParams);

  return (
    <AuthShell
      eyebrow="auth.payment.eyebrow"
      title="auth.payment.title"
      description="auth.payment.description"
    >
      <SetupAccountPaymentForm admissionId={admissionId} />
    </AuthShell>
  );
}
