import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountLoading } from "@/features/admissions-auth/presentation/components/setup-account-loading";
import { SetupAccountOtpForm } from "@/features/admissions-auth/presentation/components/setup-account-otp-form";

export const metadata: Metadata = {
  title: "Setup Account OTP | Cybe Digital School",
  description: "Verify your WhatsApp OTP before continuing to account access setup.",
};

export default function SetupAccountOtpPage() {
  return (
    <AuthShell
      eyebrow="auth.setup.otp_page.eyebrow"
      title="auth.setup.otp_page.title"
      description="auth.setup.otp_page.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/admissions/login"
    >
      <Suspense fallback={<SetupAccountLoading />}>
        <SetupAccountOtpForm />
      </Suspense>
    </AuthShell>
  );
}
