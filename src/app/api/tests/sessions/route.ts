import { proxyToAdmission } from "@/lib/admission-proxy";

// Parent books a session — requires the ds-session cookie.
export const POST = (req: Request) =>
  proxyToAdmission("POST", req, undefined, "/tests/sessions");
