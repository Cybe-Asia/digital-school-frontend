/**
 * Unleash runtime configuration.
 *
 * Resolved on the Next.js server (root layout), then passed as a prop
 * to the client-side FeatureFlagsProvider. This lets us change the
 * Unleash target per environment (school-dev / -test / -staging /
 * -prod) via k8s Deployment env vars WITHOUT rebuilding the image for
 * each env.
 *
 * This pattern avoids NEXT_PUBLIC_* vars, which Next.js inlines at
 * build time and therefore bake the value into the image — breaking
 * the "one image, promoted across envs" principle.
 */
export type UnleashRuntimeConfig = {
  url: string;
  clientKey: string;
  appName: string;
  environment: string;
  refreshInterval: number;
  /** When true, SDK will not start. Flags will always return defaults. */
  disabled: boolean;
};

/**
 * Read Unleash config from server-side env. MUST be called from a
 * Server Component or Route Handler — will return "disabled" config
 * in the browser because these env vars are not NEXT_PUBLIC_*.
 */
export function resolveUnleashConfig(): UnleashRuntimeConfig {
  const url = readEnv("UNLEASH_URL");
  const clientKey = readEnv("UNLEASH_FRONTEND_TOKEN");
  const appName = readEnv("UNLEASH_APP_NAME") ?? "digital-school-frontend";
  const environment = readEnv("UNLEASH_ENVIRONMENT") ?? "development";
  const refreshInterval = Number(readEnv("UNLEASH_REFRESH_SECONDS") ?? 15);

  // If either URL or clientKey is missing, run in "disabled" mode so
  // local dev and SSR tests don't need Unleash to be up. Flags fall
  // back to the defaults in flags.ts.
  const disabled = !url || !clientKey;

  return {
    url: url ?? "",
    clientKey: clientKey ?? "",
    appName,
    environment,
    refreshInterval,
    disabled,
  };
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
