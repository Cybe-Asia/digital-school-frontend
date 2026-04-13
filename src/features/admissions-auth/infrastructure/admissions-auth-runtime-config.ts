import {
  getServiceEndpoints,
  type ServiceEndpoints,
} from "@/features/admissions-auth/infrastructure/service-endpoints";

export type AdmissionsApiMode = "mock" | "real";

type AdmissionsAuthRuntimeEnv = Partial<
  Pick<NodeJS.ProcessEnv, "NEXT_PUBLIC_ADMISSIONS_API_MODE" | "NEXT_PUBLIC_ADMISSIONS_API_BASE_URL">
>;

export type AdmissionsAuthRuntimeConfig = {
  mode: AdmissionsApiMode;
  baseUrl: string;
  endpoints: ServiceEndpoints;
};

const DEFAULT_ADMISSIONS_API_MODE: AdmissionsApiMode =
  process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE === "real" ? "real" : "mock";

export function readAdmissionsAuthRuntimeConfig(
  env?: AdmissionsAuthRuntimeEnv,
): AdmissionsAuthRuntimeConfig {
  const mode = env
    ? env.NEXT_PUBLIC_ADMISSIONS_API_MODE === "real" ? "real" : "mock"
    : DEFAULT_ADMISSIONS_API_MODE;

  const baseUrl = env
    ? (env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL ?? "")
    : (process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL ?? "");

  return {
    mode,
    baseUrl,
    endpoints: getServiceEndpoints(),
  };
}
