import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { ResumeForm } from "@/features/admissions-auth/presentation/components/resume-form";

export const metadata: Metadata = {
  title: "Resume registration | TWSI",
  description: "Re-send your verification email and continue your application.",
};

/**
 * Landing page for parents whose `ds-setup` cookie expired or who
 * pasted their setup URL into a fresh device. The wizard guards
 * redirect here whenever the cookie-authed `/setup-context` lookup
 * fails. The form re-sends a verification email — backend treats
 * the request idempotently and 200s regardless of whether the email
 * exists in the system, to avoid enumeration.
 */
export default function SetupAccountResumePage() {
  return (
    <AuthShell
      eyebrow="auth.resume.eyebrow"
      title="auth.resume.title"
      description="auth.resume.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/admissions/login"
    >
      <ResumeForm />
    </AuthShell>
  );
}
