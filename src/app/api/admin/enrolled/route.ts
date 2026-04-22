import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { admission } = getServerServiceEndpoints();
  const qs = req.nextUrl.searchParams.toString();
  try {
    const upstream = await fetch(
      `${admission}/admin/enrolled${qs ? `?${qs}` : ""}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
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
