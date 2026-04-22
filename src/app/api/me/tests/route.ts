import { proxyToAdmission } from "@/lib/admission-proxy";

// Every test session + result for every ApplicantStudent the current
// parent owns. Used by the dashboard Tests card.
export const GET = (req: Request) =>
  proxyToAdmission("GET", req, undefined, "/me/tests");
