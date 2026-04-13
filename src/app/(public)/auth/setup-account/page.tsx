import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountLoading } from "@/features/admissions-auth/presentation/components/setup-account-loading";
import { SetupAccountForm } from "@/features/admissions-auth/presentation/components/setup-account-form";

export const metadata: Metadata = {
  title: "Setup Account | Cybe Digital School",
  description: "Set or reset your parent admissions account password.",
};

export default function SetupAccountPage() {
  return (
    <AuthShell
      eyebrow="auth.setup.eyebrow"
      title="auth.setup.title"
      description="auth.setup.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/admissions/login"
    >
      <Suspense fallback={<SetupAccountLoading />}>
        <SetupAccountForm />
      </Suspense>
    </AuthShell>
  );
}
