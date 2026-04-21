import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { AuthContinueLanding } from "@/features/admissions-auth/presentation/components/auth-continue-landing";
import { getSingleSearchParam } from "@/shared/lib/search-params";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Continue admissions",
    description: "Continuing your new application.",
  };
}

type AuthContinuePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Magic-link landing page for returning parents.
 *
 * When a parent already has an account and submits a new EOI (for another
 * child), admission-service emails them a link to /auth/continue with a
 * short-lived JWT. Clicking the link:
 *   1. Exchanges the JWT for a session cookie (POST /api/auth/session)
 *   2. Routes the parent straight to the students form for the NEW Lead
 *
 * We skip verify-email + OTP + password re-entry because the email link
 * itself proves email ownership and the underlying User already exists.
 */
export default async function AuthContinuePage({ searchParams }: AuthContinuePageProps) {
  const sp = await searchParams;
  const token = getSingleSearchParam(sp.token) ?? "";
  const admissionId = getSingleSearchParam(sp.admissionId) ?? "";

  return (
    <AuthShell
      eyebrow="auth.continue.eyebrow"
      title="auth.continue.title"
      description="auth.continue.description"
    >
      <AuthContinueLanding token={token} admissionId={admissionId} />
    </AuthShell>
  );
}
