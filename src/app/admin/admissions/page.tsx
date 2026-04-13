import type { Metadata } from "next";
import AdmissionsAdminDashboard from "@/features/admissions-admin/presentation/components/admissions-admin-dashboard";
import { getAdmissionsAdminDashboard } from "@/features/admissions-admin/application/get-admissions-admin-dashboard";
import { createAdmissionsAdminRepository } from "@/features/admissions-admin/infrastructure/create-admissions-admin-repository";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("admissions.admin.metadata_title"),
    description: t("admissions.admin.metadata_description"),
  };
}

export default async function AdmissionsAdminPage() {
  const repository = createAdmissionsAdminRepository();
  const dashboard = await getAdmissionsAdminDashboard(repository);

  return <AdmissionsAdminDashboard dashboard={dashboard} />;
}
