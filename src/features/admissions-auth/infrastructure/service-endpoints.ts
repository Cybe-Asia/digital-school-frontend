/**
 * Centralised backend service endpoint configuration.
 *
 * Every backend microservice is exposed through a single API gateway.
 * The gateway URL is set once via environment variable; individual service
 * prefixes are appended automatically.
 *
 * Environment variables (in priority order):
 *   NEXT_PUBLIC_API_GATEWAY_URL   — the shared gateway (e.g. http://10.10.10.200:32118)
 *   NEXT_PUBLIC_ADMISSIONS_API_BASE_URL — legacy fallback (kept for backwards compat)
 *
 * Per-service overrides (optional, useful for local dev when running services on different ports):
 *   NEXT_PUBLIC_ADMISSION_SERVICE_URL   — e.g. http://localhost:8080
 *   NEXT_PUBLIC_OTP_SERVICE_URL         — e.g. http://localhost:8081
 *   NEXT_PUBLIC_AUTH_SERVICE_URL         — e.g. http://localhost:8082
 *   NEXT_PUBLIC_NOTIFICATION_SERVICE_URL — e.g. http://localhost:8083
 */

function normalize(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/$/, "");
}

function resolveGatewayUrl(): string {
  return (
    normalize(process.env.NEXT_PUBLIC_API_GATEWAY_URL) ||
    normalize(process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL) ||
    ""
  );
}

export type ServiceEndpoints = {
  admission: string;
  otp: string;
  auth: string;
  notification: string;
  payment: string;
};

const SERVICE_PREFIXES = {
  admission: "/api/leads/v1",
  otp: "/api/v1/otp-service",
  auth: "/api/v1/auth-service",
  notification: "/api/email/v1",
  payment: "/api/v1/payments",
} as const;

export function getServiceEndpoints(): ServiceEndpoints {
  // Client-side: return relative paths so requests go through the Next.js
  // rewrite proxy (avoids CORS issues with cross-origin backend calls).
  // Per-service overrides still work for local dev.
  return {
    admission:
      normalize(process.env.NEXT_PUBLIC_ADMISSION_SERVICE_URL) ||
      SERVICE_PREFIXES.admission,
    otp:
      normalize(process.env.NEXT_PUBLIC_OTP_SERVICE_URL) ||
      SERVICE_PREFIXES.otp,
    auth:
      normalize(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL) ||
      SERVICE_PREFIXES.auth,
    notification:
      normalize(process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL) ||
      SERVICE_PREFIXES.notification,
    payment:
      normalize(process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL) ||
      SERVICE_PREFIXES.payment,
  };
}

/**
 * Server-side variant that also checks the non-public env variable.
 * Use this in Next.js API routes / server components only.
 */
export function getServerServiceEndpoints(): ServiceEndpoints {
  const gateway =
    normalize(process.env.API_GATEWAY_URL) ||
    normalize(process.env.ADMISSIONS_API_BASE_URL) ||
    resolveGatewayUrl();

  return {
    admission:
      normalize(process.env.ADMISSION_SERVICE_URL) ||
      `${gateway}${SERVICE_PREFIXES.admission}`,
    otp:
      normalize(process.env.OTP_SERVICE_URL) ||
      `${gateway}${SERVICE_PREFIXES.otp}`,
    auth:
      normalize(process.env.AUTH_SERVICE_URL) ||
      `${gateway}${SERVICE_PREFIXES.auth}`,
    notification:
      normalize(process.env.NOTIFICATION_SERVICE_URL) ||
      `${gateway}${SERVICE_PREFIXES.notification}`,
    payment:
      normalize(process.env.PAYMENT_SERVICE_URL) ||
      `${gateway}${SERVICE_PREFIXES.payment}`,
  };
}
