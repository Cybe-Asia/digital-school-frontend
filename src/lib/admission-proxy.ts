// Shared helper for Next.js API routes that proxy to admission-service.
//
// Cuts the boilerplate in every /api/... route.ts to a one-liner:
//
//   export const GET = (req, ctx) => proxyToAdmission("GET", req, ctx, "/admin/tests/schedules");
//
// Handles:
//  - Reading the HttpOnly ds-session cookie and forwarding as Bearer
//  - Mirroring query string + body
//  - Preserving status + content-type on the way back
//  - Wrapping network failures in a consistent 502 envelope

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

type Ctx = { params?: Promise<Record<string, string>> };
type Method = "GET" | "POST" | "PUT" | "DELETE";

/**
 * Forward a request to the admission-service under `/api/leads/v1`.
 * `pathTemplate` uses `{param}` placeholders; the param dict gets
 * url-encoded substituted before we fire. Example:
 *
 *     proxyToAdmission("POST", req, ctx,
 *       "/admin/tests/schedules/{id}/sessions", { id: params.id })
 *
 * @param requireAuth — when false, the cookie is optional (used for
 *   endpoints like "list public schedules" that need no session).
 */
export async function proxyToAdmission(
  method: Method,
  request: Request,
  ctx: Ctx,
  pathTemplate: string,
  requireAuth: boolean = true,
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (requireAuth && !token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const params = (await ctx.params) ?? {};
  let path = pathTemplate;
  for (const [k, v] of Object.entries(params)) {
    path = path.replace(`{${k}}`, encodeURIComponent(v));
  }

  const { admission } = getServerServiceEndpoints();
  const url = new URL(request.url);
  const upstreamUrl = `${admission}${path}${url.search}`;

  const headers: Record<string, string> = {};
  const ct = request.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body = method === "GET" || method === "DELETE" ? undefined : await request.text();

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
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
        responseMessage: "Upstream failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
