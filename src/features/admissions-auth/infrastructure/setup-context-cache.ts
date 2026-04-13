import type { AdmissionData, SetupContext } from "@/features/admissions-auth/domain/types";

const STORAGE_KEY = "admissions-setup-context-cache";

/**
 * Reverse mapping from backend hearAboutSchool labels to frontend heardFrom keys.
 */
const HEARD_FROM_REVERSE: Record<string, string> = {
  "Social Media": "social-media",
  "Friend / Family": "friend-family",
  "Search Engine": "search-engine",
  Event: "event",
  Other: "other",
};

/**
 * Maps a backend AdmissionData object to the frontend SetupContext (EOIInput) shape
 * used by SetupContextSummary and the additional-details form.
 */
export function mapAdmissionToSetupContext(admission: AdmissionData): SetupContext {
  const existingCount = admission.existingStudents ?? 0;

  return {
    parentName: admission.parentName,
    email: admission.email,
    whatsapp: admission.whatsappNumber,
    locationSuburb: admission.location ?? "",
    occupation: admission.occupation ?? "",
    hasExistingStudents: existingCount > 0 ? "yes" : "no",
    existingChildrenCount: existingCount > 0 ? existingCount : undefined,
    referralCode: admission.referralCode ?? undefined,
    heardFrom: HEARD_FROM_REVERSE[admission.hearAboutSchool ?? ""] ?? "other",
    school: (admission.schoolSelection?.toLowerCase() ?? "iiss") as "iihs" | "iiss",
  };
}

/**
 * Persist a SetupContext in sessionStorage so subsequent pages
 * (method, additional) can read it without calling a backend endpoint.
 */
export function cacheSetupContext(admissionId: string, context: SetupContext): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    stored[admissionId] = context;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Ignore blocked/full storage.
  }
}

/**
 * Read a previously cached SetupContext by admissionId.
 * Returns null if nothing is cached for this ID.
 */
export function readCachedSetupContext(admissionId: string): SetupContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, SetupContext>;
    return stored[admissionId] ?? null;
  } catch {
    return null;
  }
}
