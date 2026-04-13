import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParentApplicationDetailView } from "@/features/admissions-portal/presentation/components/parent-application-detail-view";
import { loadParentApplicationPageData } from "@/features/admissions-portal/presentation/lib/get-parent-application-page-data";
import { getServerI18n } from "@/i18n/server";

type ParentApplicationDecisionPageProps = {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("admissions.portal.metadata.decision_title"),
    description: t("admissions.portal.metadata.decision_description"),
  };
}

export default async function ParentApplicationDecisionPage({ params, searchParams }: ParentApplicationDecisionPageProps) {
  const { applicationId } = await params;
  const pageData = await loadParentApplicationPageData(await searchParams, applicationId);

  if (!pageData) {
    notFound();
  }

  return <ParentApplicationDetailView activeSection="decision" application={pageData.application} applications={pageData.applications} context={pageData.context} />;
}
