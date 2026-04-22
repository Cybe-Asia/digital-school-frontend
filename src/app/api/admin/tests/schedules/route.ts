import { proxyToAdmission } from "@/lib/admission-proxy";

export const GET = (req: Request, ctx: { params?: Promise<Record<string, string>> }) =>
  proxyToAdmission("GET", req, ctx, "/admin/tests/schedules");

export const POST = (req: Request, ctx: { params?: Promise<Record<string, string>> }) =>
  proxyToAdmission("POST", req, ctx, "/admin/tests/schedules");
