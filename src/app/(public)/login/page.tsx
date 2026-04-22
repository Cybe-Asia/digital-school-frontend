import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { LoginForm } from "@/features/admissions-auth/presentation/components/login-form";

export const metadata: Metadata = {
  title: "Login | Cybe Digital School",
  description: "Parent + staff sign-in for Cybe Digital School.",
};

/**
 * Canonical login URL. The older `/admissions/login` still renders the
 * same form for back-compat; this is the one we advertise and redirect
 * to after auth flows.
 */
export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="auth.login.eyebrow"
      title="auth.login.title"
      description="auth.login.description"
      footerPrompt="auth.login.footer_prompt"
      footerLinkLabel="auth.login.footer_link"
      footerHref="/register"
    >
      <LoginForm />
    </AuthShell>
  );
}
