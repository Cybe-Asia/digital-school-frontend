import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Stream a DocumentArtifact binary back to the browser, preserving
 * Content-Type + Content-Disposition so the file opens inline for
 * images/PDFs and downloads with the original filename for other
 * types. Admin-service signs the actual MinIO object; this route
 * is a pass-through with cookie → Bearer translation.
 */
export async function GET(_request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Missing artifact id" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  const upstream = `${admission}/documents/${encodeURIComponent(id)}/download`;

  try {
    const res = await fetch(upstream, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return new Response(text || res.statusText, { status: res.status });
    }
    // Stream the body through. Preserve Content-Type (so images/PDFs
    // preview inline) and Content-Disposition (so Save-as uses the
    // original filename).
    const headers = new Headers();
    const ct = res.headers.get("content-type");
    if (ct) headers.set("Content-Type", ct);
    const cd = res.headers.get("content-disposition");
    if (cd) headers.set("Content-Disposition", cd);
    return new Response(res.body, { status: 200, headers });
  } catch (err) {
    return NextResponse.json(
      {
        responseCode: 502,
        responseMessage: "Download proxy failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
