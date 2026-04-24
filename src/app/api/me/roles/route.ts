import { proxyToAdmission } from "@/lib/admission-proxy";

/**
 * Proxy to admission-service GET /me/roles. Safe to call without a
 * session cookie — admission-service returns all-false in that case.
 */
export const GET = (req: Request) =>
  proxyToAdmission("GET", req, undefined, "/me/roles");
