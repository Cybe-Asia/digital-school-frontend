import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { admission } = getServerServiceEndpoints();
  const { id } = await ctx.params;
  try {
    const upstream = await fetch(
      `${admission}/admin/tests/schedules/${encodeURIComponent(id)}/attendance.csv`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "text/csv; charset=utf-8",
        "Content-Disposition": upstream.headers.get("content-disposition") ?? `attachment; filename="attendance-${id}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
