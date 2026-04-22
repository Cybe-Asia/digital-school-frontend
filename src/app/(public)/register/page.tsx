import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { EOIForm } from "@/features/admissions-auth/presentation/components/eoi-form";

export const metadata: Metadata = {
  title: "Register | Cybe Digital School",
  description: "Start your admissions enquiry at Cybe Digital School.",
};

/**
 * Canonical registration URL. Old /admissions/register remains working
 * so historical marketing links keep flowing.
 */
export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="auth.eoi.eyebrow"
      title="auth.eoi.title"
      description="auth.eoi.description"
      footerPrompt="auth.eoi.footer_prompt"
      footerLinkLabel="auth.eoi.footer_link"
      footerHref="/login"
    >
      <EOIForm />
    </AuthShell>
  );
}
