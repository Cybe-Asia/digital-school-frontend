import { proxyToAdmission } from "@/lib/admission-proxy";

// Parent-facing schedule list — no auth required (the data is public).
export const GET = (req: Request, ctx: { params?: Promise<Record<string, string>> }) =>
  proxyToAdmission("GET", req, ctx, "/tests/schedules", /*requireAuth*/ false);
