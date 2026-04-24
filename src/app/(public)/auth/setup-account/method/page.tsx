import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountMethodForm } from "@/features/admissions-auth/presentation/components/setup-account-method-form";
import { getSetupAdmissionIdFromSearchParams } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { buildSetupStepIndicator } from "@/features/admissions-auth/presentation/lib/setup-account-steps";
import { getServerI18n } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Setup Account Method | TWSI",
  description: "Choose Google login or set your own password after OTP verification.",
};

type SetupAccountMethodPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SetupAccountMethodPage({ searchParams }: SetupAccountMethodPageProps) {
  const admissionId = getSetupAdmissionIdFromSearchParams(await searchParams);
  const { t } = await getServerI18n();

  return (
    <AuthShell
      eyebrow="auth.setup.method.eyebrow"
      title="auth.setup.method.title"
      description="auth.setup.method.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/admissions/login"
      stepIndicator={buildSetupStepIndicator(t, "method")}
    >
      <SetupAccountMethodForm admissionId={admissionId} />
    </AuthShell>
  );
}
