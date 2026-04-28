import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { AddStudentForm } from "@/features/admissions-auth/presentation/components/add-student-form";

export const metadata: Metadata = {
  title: "Add another child | TWSI",
  description: "Register another child for an existing parent account.",
};

/**
 * Landing for returning parents arriving via /auth/me/login. The
 * page itself is a server component; the form is a client island
 * that pulls the parent's session bearer from sessionStorage and
 * POSTs to /me/applications.
 *
 * Authentication is enforced by the form (no bearer -> redirect to
 * /admissions/login). The reason it's not a server-side guard is
 * that auth-services issues bearers in sessionStorage and that's
 * not visible to server components. A future refactor could move
 * sessions to an HttpOnly cookie and add a server guard here.
 */
export default function AuthMeAddStudentPage() {
  return (
    <AuthShell
      eyebrow="auth.add_student.eyebrow"
      title="auth.add_student.title"
      description="auth.add_student.description"
      footerPrompt="auth.setup.footer_prompt"
      footerLinkLabel="auth.setup.footer_link"
      footerHref="/dashboard/parent"
    >
      <AddStudentForm />
    </AuthShell>
  );
}
