import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountLoading } from "@/features/admissions-auth/presentation/components/setup-account-loading";
import { SetupAccountMethodForm } from "@/features/admissions-auth/presentation/components/setup-account-method-form";

export const metadata: Metadata = {
  title: "Setup Account Method | Cybe Digital School",
  description: "Choose Google login or set your own password after OTP verification.",
};

export default function SetupAccountMethodPage() {
  return (
    <AuthShell
      eyebrow="auth.setup.method.eyebrow"
      title="auth.setup.method.title"
      description="auth.setup.method.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/admissions/login"
    >
      <Suspense fallback={<SetupAccountLoading />}>
        <SetupAccountMethodForm />
      </Suspense>
    </AuthShell>
  );
}
