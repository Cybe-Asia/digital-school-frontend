import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountAdditionalForm } from "@/features/admissions-auth/presentation/components/setup-account-additional-form";
import { getSetupAdmissionIdFromSearchParams } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { buildSetupStepIndicator } from "@/features/admissions-auth/presentation/lib/setup-account-steps";
import { requireSetupStep } from "@/features/admissions-auth/presentation/lib/wizard-guard";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("auth.additional.metadata_title"),
    description: t("auth.additional.metadata_description"),
  };
}

type SetupAccountAdditionalPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SetupAccountAdditionalPage({ searchParams }: SetupAccountAdditionalPageProps) {
  const admissionId = getSetupAdmissionIdFromSearchParams(await searchParams);
  const { t } = await getServerI18n();

  // The students-detail form. Open from `sign_in_set` onwards so a
  // parent who pasted the URL after picking a sign-in method but
  // before submitting students lands on the right page. We also
  // accept `email_verified` for legacy flows that skip the method
  // page.
  await requireSetupStep(admissionId, ["email_verified", "sign_in_set"]);

  return (
    <AuthShell
      eyebrow="auth.additional.eyebrow"
      title="auth.additional.title"
      description="auth.additional.description"
      stepIndicator={buildSetupStepIndicator(t, "additional")}
    >
      <SetupAccountAdditionalForm admissionId={admissionId} />
    </AuthShell>
  );
}
