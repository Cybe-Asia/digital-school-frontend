import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { getDashboardConfig } from "@/lib/dashboard-data";
import en from "@/i18n/translations/en.json";

type DashboardPageProps = {
  params: Promise<{ role: string }>;
};

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const { role } = await params;
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

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { role } = await params;
  const config = getDashboardConfig(role);

  if (!config) {
    notFound();
  }

  return <DashboardShell config={config} />;
}
