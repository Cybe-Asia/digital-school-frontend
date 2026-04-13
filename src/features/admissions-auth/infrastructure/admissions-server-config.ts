type AdmissionsServerEnv = Partial<
  Pick<NodeJS.ProcessEnv, "ADMISSIONS_API_BASE_URL" | "NEXT_PUBLIC_ADMISSIONS_API_BASE_URL">
>;

function normalizeBaseUrl(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/$/, "");
}

export function readAdmissionsServerBaseUrl(env?: AdmissionsServerEnv): string {
  const runtimeEnv = env ?? process.env;

  return normalizeBaseUrl(
    runtimeEnv.ADMISSIONS_API_BASE_URL ?? runtimeEnv.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL,
  );
}
