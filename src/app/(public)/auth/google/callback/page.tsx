import type { Metadata } from "next";
import { GoogleCallbackContent } from "@/features/admissions-auth/presentation/components/google-callback-content";

export const metadata: Metadata = {
  title: "Google Login Callback | Cybe Digital School",
  description: "Handle Google login callback for admissions.",
};

type GoogleCallbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GoogleCallbackPage({ searchParams }: GoogleCallbackPageProps) {
  const params = await searchParams;
  const errorParam = params.error;
  const returnToParam = params.returnTo;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const returnTo = Array.isArray(returnToParam) ? returnToParam[0] : returnToParam;

  return <GoogleCallbackContent error={error} returnTo={returnTo} />;
}
