import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { EOIForm } from "@/features/admissions-auth/presentation/components/eoi-form";

export const metadata: Metadata = {
  title: "Admissions Enquiry | Cybe Digital School",
  description: "Parent admissions enquiry form for Cybe Digital School.",
};

export default function AdmissionsRegisterPage() {
  return (
    <AuthShell
      eyebrow="auth.eoi.eyebrow"
      title="auth.eoi.title"
      description="auth.eoi.description"
      footerPrompt="auth.eoi.footer_prompt"
      footerLinkLabel="auth.eoi.footer_link"
      footerHref="/admissions/login"
    >
      <EOIForm />
    </AuthShell>
  );
}
