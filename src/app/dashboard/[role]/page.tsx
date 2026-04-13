import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { getDashboardConfig, getParentAdmissionsContextFromSearchParams } from "@/lib/dashboard-data";
import en from "@/i18n/translations/en.json";

type DashboardPageProps = {
  params: Promise<{ role: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<DashboardPageProps, "params">): Promise<Metadata> {
  const { role } = await params;

  if (role === "staff") {
    return {
      title: en["admissions.admin.metadata_title"],
      description: en["admissions.admin.metadata_description"],
    };
  }

  const config = getDashboardConfig(role);

  if (!config) {
    return {
      title: "Dashboard Not Found",
    };
  }

  const roleLabelKey = config.roleLabelKey as keyof typeof en;
  const subtitleKey = config.subtitleKey as keyof typeof en;

  return {
    title: `${en[roleLabelKey]} Dashboard | ${en["common.brand.twsi"]}`,
    description: en[subtitleKey],
  };
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { role } = await params;

  if (role === "staff") {
    redirect("/admin/admissions");
  }

  const query = await searchParams;
  const parentAdmissionsContext = role === "parent" ? getParentAdmissionsContextFromSearchParams(query) : null;
  const config = getDashboardConfig(role, parentAdmissionsContext);

  if (!config) {
    notFound();
  }

  return <DashboardShell config={config} />;
}
