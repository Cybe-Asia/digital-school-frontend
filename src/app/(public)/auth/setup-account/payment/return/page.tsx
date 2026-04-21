import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountPaymentReturn } from "@/features/admissions-auth/presentation/components/setup-account-payment-return";
import { getSingleSearchParam } from "@/shared/lib/search-params";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Confirming your payment",
    description: "We are confirming your registration fee payment.",
  };
}

type SetupAccountPaymentReturnPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SetupAccountPaymentReturnPage({
  searchParams,
}: SetupAccountPaymentReturnPageProps) {
  const sp = await searchParams;
  const paymentId = getSingleSearchParam(sp.paymentId) ?? "";
  const initialStatus = getSingleSearchParam(sp.status) ?? "";

  return (
    <AuthShell
      eyebrow="auth.payment.eyebrow"
      title="auth.payment.return.checking"
      description="auth.payment.return.pending_description"
    >
      <SetupAccountPaymentReturn paymentId={paymentId} initialStatusHint={initialStatus} />
    </AuthShell>
  );
}
