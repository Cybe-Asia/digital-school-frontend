import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { EOISuccessView } from "@/features/admissions-auth/presentation/components/eoi-success-view";

export const metadata: Metadata = {
  title: "Interest Registered | Cybe Digital School",
  description: "Confirmation page after submitting a parent admissions enquiry.",
};

export default function AdmissionsRegisterSuccessPage() {
  return (
    <AuthShell
      eyebrow="auth.eoi.eyebrow"
      title="auth.eoi.success_title"
      description="auth.eoi.success_page_shell_description"
    >
      <EOISuccessView />
    </AuthShell>
  );
}
