import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { SetupAccountAdditionalForm } from "@/features/admissions-auth/presentation/components/setup-account-additional-form";
import { getSetupAdmissionIdFromSearchParams } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
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

  return (
    <AuthShell
      eyebrow="auth.additional.eyebrow"
      title="auth.additional.title"
      description="auth.additional.description"
    >
      <SetupAccountAdditionalForm admissionId={admissionId} />
    </AuthShell>
  );
}
