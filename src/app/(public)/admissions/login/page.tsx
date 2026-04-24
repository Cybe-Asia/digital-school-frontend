import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { LoginForm } from "@/features/admissions-auth/presentation/components/login-form";

export const metadata: Metadata = {
  title: "Admissions Login | TWSI",
  description: "Parent admissions sign-in for TWSI.",
};

export default function AdmissionsLoginPage() {
  return (
    <AuthShell
      eyebrow="auth.login.eyebrow"
      title="auth.login.title"
      description="auth.login.description"
      footerPrompt="auth.login.footer_prompt"
      footerLinkLabel="auth.login.footer_link"
      footerHref="/admissions/register"
    >
      <LoginForm />
    </AuthShell>
  );
}
