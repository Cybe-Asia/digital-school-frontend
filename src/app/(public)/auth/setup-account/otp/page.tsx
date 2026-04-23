import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountOtpForm } from "@/features/admissions-auth/presentation/components/setup-account-otp-form";
import { getSetupAdmissionIdFromSearchParams } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { buildSetupStepIndicator } from "@/features/admissions-auth/presentation/lib/setup-account-steps";
import { getSingleSearchParam } from "@/shared/lib/search-params";
import { getServerI18n } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Setup Account OTP | Cybe Digital School",
  description: "Verify your WhatsApp OTP before continuing to account access setup.",
};

type SetupAccountOtpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SetupAccountOtpPage({ searchParams }: SetupAccountOtpPageProps) {
  const resolved = await searchParams;
  const admissionId = getSetupAdmissionIdFromSearchParams(resolved);
  const phoneNumber = getSingleSearchParam(resolved.phone) ?? "";
  const { t } = await getServerI18n();

  return (
    <AuthShell
      eyebrow="auth.setup.otp_page.eyebrow"
      title="auth.setup.otp_page.title"
      description="auth.setup.otp_page.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/admissions/login"
      stepIndicator={buildSetupStepIndicator(t, "otp")}
    >
      <SetupAccountOtpForm admissionId={admissionId} phoneNumber={phoneNumber} />
    </AuthShell>
  );
}
