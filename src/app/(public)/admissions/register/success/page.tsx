import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { EOISuccessView } from "@/features/admissions-auth/presentation/components/eoi-success-view";
import { getSingleSearchParam, type SearchParamsRecord } from "@/shared/lib/search-params";

export const metadata: Metadata = {
  title: "Interest Registered | Cybe Digital School",
  description: "Confirmation page after submitting a parent admissions enquiry.",
};

type AdmissionsRegisterSuccessPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function AdmissionsRegisterSuccessPage({
  searchParams,
}: AdmissionsRegisterSuccessPageProps) {
  const params = await searchParams;
  const submittedEmail = getSingleSearchParam(params.email);

  return (
    <AuthShell
      eyebrow="auth.eoi.eyebrow"
      title="auth.eoi.success_title"
      description="auth.eoi.success_page_shell_description"
    >
      <EOISuccessView submittedEmail={submittedEmail} />
    </AuthShell>
  );
}
