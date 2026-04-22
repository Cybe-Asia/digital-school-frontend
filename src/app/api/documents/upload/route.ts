import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

// Next.js caps body at 4.5MB on Edge + 1MB for JSON by default. Lift
// the limit for this route so a 20MB family-card scan isn't rejected
// before reaching admission-service (which has its own 20MB cap).
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Multipart proxy: streams the parent's upload through to admission-
 * service, preserving the boundary and the raw bytes. We can't use
 * the shared admission-proxy helper here because that one .text()s
 * the body — fine for JSON, fatal for binary uploads.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  const contentType = request.headers.get("content-type") ?? "multipart/form-data";
  const bodyBytes = await request.arrayBuffer();

  try {
    const upstream = await fetch(`${admission}/documents/upload`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${token}`,
      },
      body: bodyBytes,
      cache: "no-store",
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        responseCode: 502,
        responseMessage: "Upload backend unavailable",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
