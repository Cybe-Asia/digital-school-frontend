import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { EOISuccessView } from "@/features/admissions-auth/presentation/components/eoi-success-view";
import { getSingleSearchParam, type SearchParamsRecord } from "@/shared/lib/search-params";

export const metadata: Metadata = {
  title: "Interest Registered | TWSI",
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
  // qa/flow-fix: the EOI submit handler now resolves one of three
  // branches and tags the success URL with `?action=`. The success
  // view uses this to vary the success message — "check your inbox"
  // vs "we already started, check your inbox" vs "we sent you a
  // sign-in link". Pre-flow-fix backends omit it; treat undefined
  // as the legacy verify-email copy.
  const action =
    (getSingleSearchParam(params.action) as
      | "verify_email"
      | "resume_existing"
      | "magic_link_sent"
      | undefined) ?? "verify_email";

  return (
    <AuthShell
      eyebrow="auth.eoi.eyebrow"
      title="auth.eoi.success_title"
      description="auth.eoi.success_page_shell_description"
    >
      <EOISuccessView submittedEmail={submittedEmail} action={action} />
    </AuthShell>
  );
}
