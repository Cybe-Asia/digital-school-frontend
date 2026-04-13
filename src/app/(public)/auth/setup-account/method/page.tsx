import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountMethodForm } from "@/features/admissions-auth/presentation/components/setup-account-method-form";
import { getSetupAdmissionIdFromSearchParams } from "@/features/admissions-auth/presentation/lib/setup-account-routes";

export const metadata: Metadata = {
  title: "Setup Account Method | Cybe Digital School",
  description: "Choose Google login or set your own password after OTP verification.",
};

type SetupAccountMethodPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SetupAccountMethodPage({ searchParams }: SetupAccountMethodPageProps) {
  const admissionId = getSetupAdmissionIdFromSearchParams(await searchParams);

  return (
    <AuthShell
      eyebrow="auth.setup.method.eyebrow"
      title="auth.setup.method.title"
      description="auth.setup.method.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/admissions/login"
    >
      <SetupAccountMethodForm admissionId={admissionId} />
    </AuthShell>
  );
}
