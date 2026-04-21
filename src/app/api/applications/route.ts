import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * POST /api/applications — server-side proxy for the "Add another child"
 * flow. Reads the HttpOnly `ds-session` cookie and forwards the JWT as
 * Authorization: Bearer to admission-service, because browsers can't
 * attach HttpOnly cookies to cross-origin fetch calls.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  const body = await request.text();
  try {
    const upstream = await fetch(`${admission}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
      cache: "no-store",
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        responseCode: 502,
        responseMessage: "Admissions backend is unavailable.",
        responseError: { formError: "api.error.network" },
        data: null,
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
