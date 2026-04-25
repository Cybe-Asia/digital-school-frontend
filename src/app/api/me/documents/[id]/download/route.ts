import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

type Ctx = { params: Promise<{ id: string }> };

type AdmissionDownloadEnvelope = {
  responseCode?: number;
  data?: {
    presignedUrl?: string;
    expiresInSeconds?: number;
  };
};

/**
 * Stream a DocumentArtifact binary back to the browser.
 *
 * Two-hop proxy because admission-service's `/documents/:id/download`
 * does NOT return file bytes — it returns JSON containing a short-
 * lived MinIO presigned URL pointing at the cluster-internal
 * `http://minio:9000/...` host. That host is unreachable from a
 * browser, so this route fetches the presigned URL itself (the
 * Next.js pod IS in-cluster) and pipes the bytes through.
 *
 * Content-Type and Content-Disposition come from MinIO's response,
 * which uses the mime_type stored on the DocumentArtifact at upload
 * time. That makes <img src=...> render images inline and the
 * browser's PDF viewer kick in for application/pdf.
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

  // Hop 1: ask admission-service for a presigned URL.
  let presignedUrl: string;
  try {
    const meta = await fetch(
      `${admission}/documents/${encodeURIComponent(id)}/download`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!meta.ok) {
      const text = await meta.text();
      return new Response(text || meta.statusText, { status: meta.status });
    }
    const body = (await meta.json()) as AdmissionDownloadEnvelope;
    const url = body?.data?.presignedUrl;
    if (!url) {
      return NextResponse.json(
        { error: "admission-service returned no presignedUrl" },
        { status: 502 },
      );
    }
    presignedUrl = url;
  } catch (err) {
    return NextResponse.json(
      {
        responseCode: 502,
        responseMessage: "presign request failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  // Hop 2: fetch the actual bytes from MinIO via the presigned URL.
  // The URL embeds its own auth (signature query params) so no
  // bearer/cookie is needed on this leg.
  try {
    const obj = await fetch(presignedUrl, { method: "GET", cache: "no-store" });
    if (!obj.ok) {
      const text = await obj.text();
      return new Response(text || obj.statusText, { status: obj.status });
    }
    // Pass through Content-Type (so <img> / iframe render inline) and
    // Content-Disposition (so explicit Save-as uses the original filename).
    const headers = new Headers();
    const ct = obj.headers.get("content-type");
    if (ct) headers.set("Content-Type", ct);
    const cd = obj.headers.get("content-disposition");
    if (cd) headers.set("Content-Disposition", cd);
    const cl = obj.headers.get("content-length");
    if (cl) headers.set("Content-Length", cl);
    return new Response(obj.body, { status: 200, headers });
  } catch (err) {
    return NextResponse.json(
      {
        responseCode: 502,
        responseMessage: "object fetch failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
