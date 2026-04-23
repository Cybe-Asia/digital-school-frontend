import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { proxyToAdmission } from "@/lib/admission-proxy";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

export const GET = (req: Request) =>
  proxyToAdmission("GET", req, undefined, "/me/document-requests");

/**
 * Parent document upload. Admission-service expects multipart/form-data
 * (document_request_id, document_type, file) on this same path.
 *
 * The shared `proxyToAdmission` helper serialises the body as text,
 * which destroys the multipart boundary — so we stream the raw body
 * through to the upstream service unchanged here instead of going
 * through the generic proxy.
 */
export async function POST(request: Request): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  // Admin-service exposes GET /me/document-requests (list) and
  // POST /documents/upload (multipart upload). Route the upload
  // body to the right path.
  const upstream = `${admission}/documents/upload`;

  const contentType = request.headers.get("content-type") ?? "application/octet-stream";
  const body = await request.arrayBuffer();

  try {
    const res = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${token}`,
      },
      body,
      cache: "no-store",
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        responseCode: 502,
        responseMessage: "Upload proxy failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
