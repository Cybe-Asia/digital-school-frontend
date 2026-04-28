import "server-only";

import { redirect } from "next/navigation";
import { fetchServerSetupContext } from "@/features/admissions-auth/infrastructure/server-setup-context";
import type { SetupStep } from "@/features/admissions-auth/domain/types";
import { stepToRoute } from "@/features/admissions-auth/presentation/lib/step-to-route";

/**
 * Server-side guard for setup-account wizard pages.
 *
 * Fetches the parent's current `setup_step` from the backend (cookie-
 * authed) and redirects out if:
 *   - We can't authenticate them   → /auth/setup-account/resume
 *   - They're at a different step  → canonical page for actual step
 *
 * Caller passes the step the page expects. For pages that accept
 * multiple steps (e.g. /payment can be re-visited after paid), pass
 * a list and the guard accepts any of them.
 *
 * NOTE: Server actions in Next.js can throw a magic `redirect()`
 * marker — this helper relies on that, so it never returns when it
 * triggers a redirect. Callers don't need to early-return.
 */
export async function requireSetupStep(
  admissionId: string,
  expected: SetupStep | SetupStep[],
): Promise<void> {
  if (!admissionId) {
    redirect("/auth/setup-account/resume");
  }

  const result = await fetchServerSetupContext(admissionId);
  if (!result.success) {
    redirect("/auth/setup-account/resume");
  }

  const accepted = Array.isArray(expected) ? expected : [expected];
  if (!accepted.includes(result.setupStep)) {
    redirect(stepToRoute(result.setupStep, admissionId));
  }
}
