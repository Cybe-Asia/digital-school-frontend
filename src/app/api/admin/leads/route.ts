import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * Admin leads list. Forwards the query-string verbatim to admission-service
 * so every filter the backend supports (status, school, search, dateFrom,
 * dateTo, hasApplication, limit, offset) works without a per-field mapping
 * here. 403 on non-admin sessions passes through.
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  const qs = req.nextUrl.searchParams.toString();
  const url = `${admission}/admin/leads${qs ? `?${qs}` : ""}`;
  try {
    const upstream = await fetch(url, {
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
