import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountForm } from "@/features/admissions-auth/presentation/components/setup-account-form";
import {
  getSetupAdmissionIdFromSearchParams,
  getSetupTokenFromSearchParams,
} from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { buildSetupStepIndicator } from "@/features/admissions-auth/presentation/lib/setup-account-steps";
import { getServerI18n } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Setup Account | TWSI",
  description: "Set or reset your parent admissions account password.",
};

type SetupAccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SetupAccountPage({ searchParams }: SetupAccountPageProps) {
  const params = await searchParams;
  const token = getSetupTokenFromSearchParams(params);
  const admissionId = getSetupAdmissionIdFromSearchParams(params);
  const { t } = await getServerI18n();

  return (
    <AuthShell
      eyebrow="auth.setup.eyebrow"
      title="auth.setup.title"
      description="auth.setup.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/admissions/login"
      stepIndicator={buildSetupStepIndicator(t, "account")}
    >
      <SetupAccountForm token={token} admissionId={admissionId} />
    </AuthShell>
  );
}
