import "server-only";

import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import type {
  AdmissionData,
  SetupStep,
} from "@/features/admissions-auth/domain/types";
import type { AdmissionsApiResponse } from "@/features/admissions-auth/infrastructure/admissions-api-contract";

/**
 * Server-side counterpart to `ApiAdmissionsAuthRepository.getSetupContext`.
 * Forwards the `ds-setup` HttpOnly cookie from the incoming request to
 * the admission-service backend so wizard route guards can run on the
 * server (no client round-trip required).
 *
 * Returns a narrowly-typed result that includes `setupStep` — the
 * field the route guards key off. We don't depend on the
 * sessionStorage cache here because that's client-only.
 */

export type ServerSetupContextResult =
  | {
      success: true;
      admission: AdmissionData;
      setupStep: SetupStep;
    }
  | { success: false; status: number; reason: string };

const STEP_VALUES: SetupStep[] = [
  "eoi_submitted",
  "email_verified",
  "sign_in_set",
  "students_added",
  "application_fee_paid",
  "test_booked",
  "test_completed",
  "documents_requested",
  "documents_complete",
  "offer_pending",
  "closed",
];

function asSetupStep(value: unknown): SetupStep {
  if (typeof value === "string" && (STEP_VALUES as readonly string[]).includes(value)) {
    return value as SetupStep;
  }
  // Older Lead nodes that haven't been touched by the backfill yet
  // default to the safest "just verified" state. The backfill
  // migration runs at service boot — this fallback only fires for
  // the brief window before that completes.
  return "email_verified";
}

export async function fetchServerSetupContext(
  admissionId: string,
): Promise<ServerSetupContextResult> {
  if (!admissionId) {
    return { success: false, status: 400, reason: "missing-admission-id" };
  }

  const endpoints = getServerServiceEndpoints();
  if (!endpoints.admission) {
    return { success: false, status: 500, reason: "no-admission-endpoint" };
  }

  const cookieStore = await cookies();
  const dsSetup = cookieStore.get("ds-setup")?.value;
  if (!dsSetup) {
    // No cookie — guard pushes the parent to /resume. Don't try the
    // backend with an empty cookie; the 401 is wasted bandwidth.
    return { success: false, status: 401, reason: "no-ds-setup-cookie" };
  }

  const url = `${endpoints.admission}/setup-context?admissionId=${encodeURIComponent(
    admissionId,
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Forward the cookie explicitly. Next.js server-side fetch
        // doesn't carry browser cookies automatically.
        Cookie: `ds-setup=${dsSetup}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { success: false, status: response.status, reason: "backend-non-200" };
    }
    const parsed = (await response.json()) as AdmissionsApiResponse<AdmissionData>;
    if (parsed.responseCode < 200 || parsed.responseCode >= 300 || !parsed.data) {
      return { success: false, status: parsed.responseCode, reason: "envelope-non-200" };
    }
    return {
      success: true,
      admission: parsed.data,
      setupStep: asSetupStep((parsed.data as { setupStep?: unknown }).setupStep),
    };
  } catch {
    return { success: false, status: 502, reason: "network-error" };
  }
}
