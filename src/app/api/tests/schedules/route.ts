import { proxyToAdmission } from "@/lib/admission-proxy";

// Parent-facing schedule list — no auth required (the data is public).
export const GET = (req: Request) =>
  proxyToAdmission("GET", req, undefined, "/tests/schedules", /*requireAuth*/ false);
