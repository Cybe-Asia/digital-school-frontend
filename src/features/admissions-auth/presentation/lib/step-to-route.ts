import type { SetupStep } from "@/features/admissions-auth/domain/types";

/**
 * Inverse of the backend `Lead.setup_step` enum: given the parent's
 * current step, return the URL of the page they should be on.
 *
 * Used by the wizard route guards to redirect mismatched URLs back to
 * the canonical page for the actual step. Without this mapping a
 * parent who closes /students and pastes /payment into a fresh tab
 * would see a half-broken Pay button (no studentCount) instead of
 * being walked back through the missing step.
 *
 * Steps past the wizard (test_*, documents_*, offer_*, closed) all
 * route to /dashboard/parent — once a parent has paid, the parent
 * dashboard is the source of truth and routes per-applicant from
 * there.
 *
 * Stays in lockstep with `STEP_*` consts in admission-service's
 * `lead_model.rs`. Don't add a value here without also adding it
 * there, or the redirect for an unknown step falls through to the
 * dashboard which is the safest default but loses the wizard
 * context.
 */
export function stepToRoute(step: SetupStep | string, admissionId: string): string {
  const ROUTES: Record<string, (id: string) => string> = {
    eoi_submitted: (id) => `/auth/setup-account?admissionId=${encodeURIComponent(id)}`,
    email_verified: (id) => `/auth/setup-account?admissionId=${encodeURIComponent(id)}`,
    sign_in_set: (id) => `/auth/setup-account/method?admissionId=${encodeURIComponent(id)}`,
    students_added: (id) => `/auth/setup-account/payment?admissionId=${encodeURIComponent(id)}`,
    application_fee_paid: (id) =>
      `/auth/setup-account/tests?admissionId=${encodeURIComponent(id)}`,
    test_booked: () => `/dashboard/parent`,
    test_completed: () => `/dashboard/parent`,
    documents_requested: () => `/dashboard/parent`,
    documents_complete: () => `/dashboard/parent`,
    offer_pending: () => `/dashboard/parent`,
    closed: () => `/dashboard/parent`,
  };

  const fn = ROUTES[step];
  return fn ? fn(admissionId) : `/dashboard/parent`;
}

/**
 * Map every page in the wizard onto the `setup_step` value the user
 * must be at to view that page. Used by the route guard so each page
 * declares its own expected step rather than scattering string
 * literals across a dozen Next.js route files.
 *
 * Pages not in this map have no guard.
 */
export const PAGE_EXPECTED_STEP: Record<string, SetupStep> = {
  // /auth/setup-account/method — the sign-in method picker. Open to
  // anyone past email verification.
  method: "email_verified",
  // /auth/setup-account/additional — the students form. Parent must
  // have set their sign-in method first.
  additional: "sign_in_set",
  // /auth/setup-account/payment — the application-fee invoice page.
  // Only valid once students are submitted.
  payment: "students_added",
  // /auth/setup-account/tests — book the entrance test. Valid once
  // the application fee is paid.
  tests: "application_fee_paid",
};
