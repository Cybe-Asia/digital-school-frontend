import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import type { ParentMePayload } from "@/lib/dashboard-data";

/**
 * Richer shape of the /me response. `dashboard-data.ts` declares the narrow
 * subset it uses to render the parent landing page; the admissions-portal
 * pages need a few more fields (per-application payment metadata, the nested
 * applications array, applicantStatus values, etc.). We type those as
 * optional extensions so both consumers share the same fetch.
 *
 * TODO(admissions-portal): once the parent dashboard also needs the nested
 * `applications[]` (e.g. to show per-kid gating), drop the narrow
 * `ParentMePayload` in dashboard-data and re-export this richer shape.
 */
export type ParentMeRawLead = ParentMePayload["lead"] & {
  whatsappNumber?: string;
  occupation?: string | null;
};

export type ParentMeRawStudent = ParentMePayload["students"][number] & {
  // Per-student lifecycle status echoed from the admission-service Neo4j
  // graph. We don't enforce an enum here — the server side owns the
  // transition rules and we map defensively.
  applicantStatus?: string;
};

export type ParentMeRawPayment = {
  paymentId?: string;
  paymentType?: string;
  status?: string;
  amount?: number | string | null;
  currency?: string | null;
  hostedInvoiceUrl?: string | null;
  paidAt?: string | null;
  dueAt?: string | null;
  invoiceNumber?: string | null;
  referenceNumber?: string | null;
  /** Real per-invoice line items from the admission-service. Each entry
   *  is rendered verbatim — description text is backend-owned. */
  lineItems?: Array<{
    description: string;
    amount: number;
    currency: string;
  }>;
};

export type ParentMeApplication = {
  lead?: Partial<ParentMeRawLead> & { admissionId?: string };
  students?: ParentMeRawStudent[];
  student?: ParentMeRawStudent; // some backends inline a single student
  latestPayment?: ParentMeRawPayment | null;
};

export type ParentMeRichPayload = ParentMePayload & {
  latestPayment?: ParentMeRawPayment | null;
  applications?: ParentMeApplication[];
};

export type ParentMeFetchResult =
  | { kind: "ok"; payload: ParentMeRichPayload }
  | { kind: "unauthenticated" }
  | { kind: "error"; status: number; detail: string };

/**
 * Fetch the admission-service `/me` endpoint using the given JWT. Mirrors the
 * server-side logic already used by /parent/dashboard, lifted here so the
 * admissions-portal pages don't duplicate it.
 */
export async function fetchParentMe(token: string | undefined | null): Promise<ParentMeFetchResult> {
  if (!token) {
    return { kind: "unauthenticated" };
  }

  const { admission } = getServerServiceEndpoints();

  try {
    const res = await fetch(`${admission}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const raw = await res.text().catch(() => "");
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { kind: "unauthenticated" };
      }
      return { kind: "error", status: res.status, detail: raw.slice(0, 400) || res.statusText };
    }
    let body: { data?: ParentMeRichPayload } | null = null;
    try {
      body = raw ? (JSON.parse(raw) as { data?: ParentMeRichPayload }) : null;
    } catch {
      return { kind: "error", status: res.status, detail: "Invalid JSON from /me" };
    }
    if (!body?.data) {
      return { kind: "error", status: res.status, detail: "Empty data field in /me response" };
    }
    return { kind: "ok", payload: body.data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { kind: "error", status: 0, detail: `Network error: ${msg}` };
  }
}
