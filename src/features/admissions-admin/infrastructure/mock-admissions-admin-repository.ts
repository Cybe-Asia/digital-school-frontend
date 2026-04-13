import type { AdmissionsAdminRepository } from "@/features/admissions-admin/domain/ports/admissions-admin-repository";
import type { AdmissionsAdminDashboard } from "@/features/admissions-admin/domain/types";

export class MockAdmissionsAdminRepository implements AdmissionsAdminRepository {
  async getDashboard(): Promise<AdmissionsAdminDashboard> {
    return {
      summaryCards: [
        {
          labelKey: "admissions.admin.summary.new_leads.label",
          value: "24",
          helperKey: "admissions.admin.summary.new_leads.helper",
        },
        {
          labelKey: "admissions.admin.summary.review_ready.label",
          value: "12",
          helperKey: "admissions.admin.summary.review_ready.helper",
        },
        {
          labelKey: "admissions.admin.summary.payment_checks.label",
          value: "7",
          helperKey: "admissions.admin.summary.payment_checks.helper",
        },
        {
          labelKey: "admissions.admin.summary.offers_today.label",
          value: "3",
          helperKey: "admissions.admin.summary.offers_today.helper",
        },
      ],
      pipeline: [
        {
          titleKey: "admissions.admin.pipeline.leads",
          count: 24,
          items: [
            {
              studentName: "Aisha Rahma",
              parentName: "Siti Rahmawati",
              detailKey: "admissions.admin.pipeline_detail.leads",
              badgeKey: "admissions.admin.badge.new",
            },
            {
              studentName: "Naufal Arkan",
              parentName: "Dewi Anggraini",
              detailKey: "admissions.admin.pipeline_detail.leads",
              badgeKey: "admissions.admin.badge.follow_up",
            },
          ],
        },
        {
          titleKey: "admissions.admin.pipeline.documents",
          count: 9,
          items: [
            {
              studentName: "Rayyan Rahma",
              parentName: "Siti Rahmawati",
              detailKey: "admissions.admin.pipeline_detail.documents",
              badgeKey: "admissions.admin.badge.missing_document",
            },
            {
              studentName: "Zara Putri",
              parentName: "Hani Maulida",
              detailKey: "admissions.admin.pipeline_detail.documents",
              badgeKey: "admissions.admin.badge.pending_review",
            },
          ],
        },
        {
          titleKey: "admissions.admin.pipeline.assessment",
          count: 6,
          items: [
            {
              studentName: "Bilal Adzra",
              parentName: "Rina Puspita",
              detailKey: "admissions.admin.pipeline_detail.assessment",
              badgeKey: "admissions.admin.badge.scheduled",
            },
            {
              studentName: "Mika Salsabila",
              parentName: "Rudi Hartono",
              detailKey: "admissions.admin.pipeline_detail.assessment",
              badgeKey: "admissions.admin.badge.awaiting_slot",
            },
          ],
        },
        {
          titleKey: "admissions.admin.pipeline.offer",
          count: 3,
          items: [
            {
              studentName: "Faris Hidayat",
              parentName: "Alya Fitri",
              detailKey: "admissions.admin.pipeline_detail.offer",
              badgeKey: "admissions.admin.badge.ready_offer",
            },
            {
              studentName: "Nadia Safitri",
              parentName: "Mira Wulandari",
              detailKey: "admissions.admin.pipeline_detail.offer",
              badgeKey: "admissions.admin.badge.awaiting_call",
            },
          ],
        },
      ],
      priorityQueues: [
        {
          titleKey: "admissions.admin.queue.payments.title",
          count: "7",
          helperKey: "admissions.admin.queue.payments.helper",
          ctaKey: "admissions.admin.queue.payments.cta",
        },
        {
          titleKey: "admissions.admin.queue.documents.title",
          count: "9",
          helperKey: "admissions.admin.queue.documents.helper",
          ctaKey: "admissions.admin.queue.documents.cta",
        },
        {
          titleKey: "admissions.admin.queue.decisions.title",
          count: "3",
          helperKey: "admissions.admin.queue.decisions.helper",
          ctaKey: "admissions.admin.queue.decisions.cta",
        },
      ],
      upcomingItems: [
        {
          time: "09:00",
          titleKey: "admissions.admin.timeline.parent_calls.title",
          detailKey: "admissions.admin.timeline.parent_calls.detail",
        },
        {
          time: "11:30",
          titleKey: "admissions.admin.timeline.finance_checks.title",
          detailKey: "admissions.admin.timeline.finance_checks.detail",
        },
        {
          time: "14:00",
          titleKey: "admissions.admin.timeline.assessment_sync.title",
          detailKey: "admissions.admin.timeline.assessment_sync.detail",
        },
      ],
    };
  }
}
