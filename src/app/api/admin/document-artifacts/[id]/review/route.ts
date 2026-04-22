import { proxyToAdmission } from "@/lib/admission-proxy";

export const POST = (req: Request, ctx: { params: Promise<{ id: string }> }) =>
  proxyToAdmission("POST", req, ctx, "/admin/document-artifacts/{id}/review");
