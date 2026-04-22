import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * POST proxy for the admin "advance application status" action. Reads
 * the HttpOnly ds-session cookie, forwards as Authorization: Bearer to
 * admission-service. Backend enforces the admin-email allowlist.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  const body = await request.text();
  try {
    const upstream = await fetch(
      `${admission}/admin/applications/${encodeURIComponent(id)}/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
        cache: "no-store",
      },
    );
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
