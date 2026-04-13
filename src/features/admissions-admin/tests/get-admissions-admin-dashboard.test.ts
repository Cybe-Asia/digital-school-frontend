import { getAdmissionsAdminDashboard } from "@/features/admissions-admin/application/get-admissions-admin-dashboard";
import { createAdmissionsAdminRepository } from "@/features/admissions-admin/infrastructure/create-admissions-admin-repository";

describe("getAdmissionsAdminDashboard", () => {
  it("returns modular admin admissions data", async () => {
    const repository = createAdmissionsAdminRepository();
    const dashboard = await getAdmissionsAdminDashboard(repository);

    expect(dashboard.summaryCards).toHaveLength(4);
    expect(dashboard.pipeline).toHaveLength(4);
    expect(dashboard.priorityQueues[0]?.titleKey).toBe("admissions.admin.queue.payments.title");
    expect(dashboard.upcomingItems[0]?.time).toBe("09:00");
  });
});
