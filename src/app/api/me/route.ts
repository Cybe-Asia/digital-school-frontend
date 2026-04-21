import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * Proxy to the admission-service /api/leads/v1/me.
 *
 * Browsers can't attach the HttpOnly `ds-session` cookie to cross-origin
 * fetches, so we read it server-side here and forward the JWT as
 * `Authorization: Bearer ...` to the backend.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  const url = `${admission}/me`;

  try {
    const upstream = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await upstream.json().catch(() => ({}));
    return NextResponse.json(body, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Upstream /me request failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
