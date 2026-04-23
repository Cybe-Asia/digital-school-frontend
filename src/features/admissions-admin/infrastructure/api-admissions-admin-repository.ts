import type { AdmissionsAdminRepository } from "@/features/admissions-admin/domain/ports/admissions-admin-repository";
import type { AdmissionsAdminDashboard } from "@/features/admissions-admin/domain/types";

/**
 * Real admission-service implementation of {@link AdmissionsAdminRepository}.
 *
 * Backend reference (all on admission-service, prefix `/api/leads/v1`):
 *   GET /admin/funnel       — counter roll-up used for the summary cards.
 *   GET /admin/leads        — lead list (NOT paged into this dashboard yet).
 *   GET /admin/applications — applicant list (NOT paged into this dashboard yet).
 *   GET /admin/enrolled     — enrolled list (NOT paged into this dashboard yet).
 *   GET /admin/audit        — audit events (NOT used here).
 *   GET /admin/settings     — admin settings (NOT used here).
 *
 * The hexagonal `AdmissionsAdminDashboard` shape was designed around the old
 * mock and includes per-stage pipeline item lists (student/parent names) and a
 * scheduled timeline. The backend's funnel response only exposes counters, so
 * we map what we can and leave the rest empty — we would rather show empty
 * columns than invented student names.
 *
 * The ad-hoc `src/app/admin/admissions/page.tsx` page currently bypasses this
 * repository and fetches `/admin/funnel` directly. This class exists so a
 * future migration back onto the hexagonal dashboard component has a real
 * repository to bind to. There is no longer a mock in the factory.
 */

type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type FunnelResponse = {
  leadCounts: Record<string, number>;
  studentCounts: Record<string, number>;
  stuckCounts: {
    stuckTestPending7d: number;
    stuckDocsPending7d: number;
    stuckOfferIssued7d: number;
  };
  weeklyNewLeads: number;
  weeklyEnrolled: number;
  computedAt: string;
};

export class ApiAdmissionsAdminRepository implements AdmissionsAdminRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  async getDashboard(): Promise<AdmissionsAdminDashboard> {
    const response = await fetch(`${this.baseUrl}/admin/funnel`, {
      method: "GET",
      headers: { Authorization: `Bearer ${this.token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`admission-service /admin/funnel responded ${response.status}`);
    }

    const body = (await response.json()) as ApiEnvelope<FunnelResponse>;
    const funnel = body.data;
    if (!funnel) {
      throw new Error("admission-service /admin/funnel returned no data");
    }

    const totalNewLeads = funnel.leadCounts["new"] ?? 0;
    const totalApplicants = sumValues(funnel.studentCounts);
    const paymentChecks = funnel.leadCounts["paid"] ?? 0;
    const offersIssuedToday = funnel.studentCounts["offer_issued"] ?? 0;

    return {
      summaryCards: [
        {
          labelKey: "admissions.admin.summary.new_leads.label",
          value: String(totalNewLeads),
          helperKey: "admissions.admin.summary.new_leads.helper",
        },
        {
          labelKey: "admissions.admin.summary.review_ready.label",
          value: String(totalApplicants),
          helperKey: "admissions.admin.summary.review_ready.helper",
        },
        {
          labelKey: "admissions.admin.summary.payment_checks.label",
          value: String(paymentChecks),
          helperKey: "admissions.admin.summary.payment_checks.helper",
        },
        {
          labelKey: "admissions.admin.summary.offers_today.label",
          value: String(offersIssuedToday),
          helperKey: "admissions.admin.summary.offers_today.helper",
        },
      ],
      // The `/admin/funnel` endpoint only exposes counters; it does not
      // enumerate student/parent names per stage. Populating these lists
      // would require an additional paged call to `/admin/leads` and
      // `/admin/applications` per stage — omitted here to avoid rendering
      // stale or partial rows.
      pipeline: [
        {
          titleKey: "admissions.admin.pipeline.leads",
          count: sumValues(funnel.leadCounts),
          items: [],
        },
        {
          titleKey: "admissions.admin.pipeline.documents",
          count: funnel.studentCounts["documents_pending"] ?? 0,
          items: [],
        },
        {
          titleKey: "admissions.admin.pipeline.assessment",
          count:
            (funnel.studentCounts["test_pending"] ?? 0) +
            (funnel.studentCounts["test_scheduled"] ?? 0),
          items: [],
        },
        {
          titleKey: "admissions.admin.pipeline.offer",
          count: funnel.studentCounts["offer_issued"] ?? 0,
          items: [],
        },
      ],
      priorityQueues: [
        {
          titleKey: "admissions.admin.queue.payments.title",
          count: String(funnel.leadCounts["paid"] ?? 0),
          helperKey: "admissions.admin.queue.payments.helper",
          ctaKey: "admissions.admin.queue.payments.cta",
        },
        {
          titleKey: "admissions.admin.queue.documents.title",
          count: String(funnel.stuckCounts.stuckDocsPending7d),
          helperKey: "admissions.admin.queue.documents.helper",
          ctaKey: "admissions.admin.queue.documents.cta",
        },
        {
          titleKey: "admissions.admin.queue.decisions.title",
          count: String(funnel.stuckCounts.stuckOfferIssued7d),
          helperKey: "admissions.admin.queue.decisions.helper",
          ctaKey: "admissions.admin.queue.decisions.cta",
        },
      ],
      // There is no scheduled-timeline endpoint on admission-service, so we
      // return an empty list. The dashboard component hides the section
      // when it's empty.
      upcomingItems: [],
    };
  }
}

function sumValues(counts: Record<string, number>): number {
  return Object.values(counts).reduce((acc, n) => acc + n, 0);
}
