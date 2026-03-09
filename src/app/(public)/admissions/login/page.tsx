import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { LoginForm } from "@/features/admissions-auth/presentation/components/login-form";

export const metadata: Metadata = {
  title: "Admissions Login | Cybe Digital School",
  description: "Parent admissions sign-in for Cybe Digital School.",
};

export default function AdmissionsLoginPage() {
  return (
    <AuthShell
      eyebrow="Admissions Login"
      title="Sign in to continue your family admissions process."
      description="Use your admissions email and password to continue with the next frontend-ready step of the parent registration journey."
      footerPrompt="Need a new account?"
      footerLinkLabel="Register here"
      footerHref="/admissions/register"
    >
      <LoginForm />
    </AuthShell>
  );
}
