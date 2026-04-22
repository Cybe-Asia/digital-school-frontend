import { proxyToAdmission } from "@/lib/admission-proxy";

// Every test session + result for every ApplicantStudent the current
// parent owns. Used by the dashboard Tests card.
export const GET = (req: Request, ctx: { params?: Promise<Record<string, string>> }) =>
  proxyToAdmission("GET", req, ctx, "/me/tests");
