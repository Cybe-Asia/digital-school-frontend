import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { getDashboardConfig } from "@/lib/dashboard-data";

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

  return {
    title: `${config.roleLabel} Dashboard | TWSI Digital School`,
    description: config.subtitle,
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
