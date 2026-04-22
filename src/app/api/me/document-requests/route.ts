import { proxyToAdmission } from "@/lib/admission-proxy";

export const GET = (req: Request) =>
  proxyToAdmission("GET", req, undefined, "/me/document-requests");
