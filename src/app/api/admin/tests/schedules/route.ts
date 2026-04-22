import { proxyToAdmission } from "@/lib/admission-proxy";

export const GET = (req: Request) =>
  proxyToAdmission("GET", req, undefined, "/admin/tests/schedules");

export const POST = (req: Request) =>
  proxyToAdmission("POST", req, undefined, "/admin/tests/schedules");
