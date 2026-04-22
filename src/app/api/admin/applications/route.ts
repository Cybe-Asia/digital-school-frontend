import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * Admin list proxy: reads the ds-session cookie and forwards the JWT to
 * admission-service's /admin/applications endpoint.
 *
 * Backend rejects with 403 if the session's email isn't in ADMIN_EMAILS;
 * we just pass that status through so the UI can render a "not admin"
 * message.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  try {
    const upstream = await fetch(`${admission}/admin/applications`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
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
