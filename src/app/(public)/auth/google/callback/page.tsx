import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GoogleCallbackContent } from "@/features/admissions-auth/presentation/components/google-callback-content";
import { getSingleSearchParam, type SearchParamsRecord } from "@/shared/lib/search-params";

export const metadata: Metadata = {
  title: "Google Login Callback | TWSI",
  description: "Handle Google login callback for admissions.",
};

type GoogleCallbackPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

function getSafeReturnTo(value: string | undefined): string | undefined {
  if (!value || !value.startsWith("/")) {
    return undefined;
  }

  return value;
}

export default async function GoogleCallbackPage({ searchParams }: GoogleCallbackPageProps) {
  const params = await searchParams;
  const error = getSingleSearchParam(params.error) ?? undefined;
  const returnTo = getSafeReturnTo(getSingleSearchParam(params.returnTo) ?? undefined);

  if (!error && returnTo) {
    redirect(returnTo);
  }

  return <GoogleCallbackContent error={error} returnTo={returnTo} />;
}
