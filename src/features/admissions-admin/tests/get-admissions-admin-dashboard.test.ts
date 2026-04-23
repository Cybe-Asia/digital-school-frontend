import { getAdmissionsAdminDashboard } from "@/features/admissions-admin/application/get-admissions-admin-dashboard";
import { ApiAdmissionsAdminRepository } from "@/features/admissions-admin/infrastructure/api-admissions-admin-repository";

describe("getAdmissionsAdminDashboard (admission-service)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps the /admin/funnel counters into the dashboard shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        responseCode: 200,
        responseMessage: "success",
        data: {
          leadCounts: { new: 24, verified: 10, paid: 7, dropped: 2 },
          studentCounts: {
            documents_pending: 9,
            test_pending: 4,
            test_scheduled: 2,
            offer_issued: 3,
          },
          stuckCounts: {
            stuckTestPending7d: 1,
            stuckDocsPending7d: 2,
            stuckOfferIssued7d: 3,
          },
          weeklyNewLeads: 12,
          weeklyEnrolled: 4,
          computedAt: "2026-04-23T08:00:00Z",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAdminRepository(
      "https://api.school.test/api/leads/v1",
      "test-jwt",
    );
    const dashboard = await getAdmissionsAdminDashboard(repository);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/api/leads/v1/admin/funnel",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-jwt" },
      }),
    );

    expect(dashboard.summaryCards).toHaveLength(4);
    expect(dashboard.summaryCards[0]?.value).toBe("24");
    expect(dashboard.summaryCards[1]?.value).toBe("18"); // sum of studentCounts
    expect(dashboard.summaryCards[2]?.value).toBe("7");
    expect(dashboard.summaryCards[3]?.value).toBe("3");

    expect(dashboard.pipeline).toHaveLength(4);
    // We intentionally do not synthesise per-stage student rows from
    // counters — /admin/funnel only exposes numbers.
    expect(dashboard.pipeline.every((column) => column.items.length === 0)).toBe(true);
    expect(dashboard.pipeline[0]?.count).toBe(43); // sum of leadCounts
    expect(dashboard.pipeline[2]?.count).toBe(6); // test_pending + test_scheduled

    expect(dashboard.priorityQueues[0]?.count).toBe("7");
    expect(dashboard.priorityQueues[1]?.count).toBe("2");
    expect(dashboard.priorityQueues[2]?.count).toBe("3");

    // No scheduled-timeline endpoint exists — we return an empty list
    // rather than inventing one.
    expect(dashboard.upcomingItems).toEqual([]);
  });

  it("throws when the backend rejects the call", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ responseCode: 403, responseMessage: "forbidden" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAdminRepository(
      "https://api.school.test/api/leads/v1",
      "bad-jwt",
    );

    await expect(getAdmissionsAdminDashboard(repository)).rejects.toThrow(/403/);
  });
});
