import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { RequestPasswordResetForm } from "@/features/admissions-auth/presentation/components/request-password-reset-form";

export const metadata: Metadata = {
  title: "Reset Password | TWSI",
  description: "Request a password reset link for admissions login.",
};

export default function RequestResetPage() {
  return (
    <AuthShell
      eyebrow="auth.reset.eyebrow"
      title="auth.reset.title"
      description="auth.reset.description"
      footerPrompt="auth.reset.footer_prompt"
      footerLinkLabel="auth.reset.footer_link"
      footerHref="/admissions/login"
    >
      <RequestPasswordResetForm />
    </AuthShell>
  );
}
