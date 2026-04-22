import { proxyToAdmission } from "@/lib/admission-proxy";

export const GET = (req: Request, ctx: { params: Promise<{ id: string }> }) =>
  proxyToAdmission("GET", req, ctx, "/admin/document-requests/{id}");
