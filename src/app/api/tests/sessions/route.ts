import { proxyToAdmission } from "@/lib/admission-proxy";

// Parent books a session — requires the ds-session cookie.
export const POST = (req: Request, ctx: { params?: Promise<Record<string, string>> }) =>
  proxyToAdmission("POST", req, ctx, "/tests/sessions");
