import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { ArtifactReviewRow } from "./artifact-review-row";

export const metadata: Metadata = { title: "Document review | Admin" };

const SESSION_COOKIE_NAME = "ds-session";
type Envelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Req = {
  documentRequestId: string;
  tenantId: string;
  applicantStudentId: string;
  requestType: string;
  requiredDocumentTypes: string;
  status: string;
  requestedAt: string;
  dueAt?: string | null;
};

type Artifact = {
  documentArtifactId: string;
  documentRequestId: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  documentHash: string;
  status: string;
  uploadedAt: string;
};

type Detail = { request: Req; artifacts: Artifact[] };

type PageProps = {
  params: Promise<{ id: string; req: string }>;
};

/**
 * Admin document-review page. One DocumentRequest per page; lists
 * every uploaded artifact with a download link, a review form
 * (approve / reject / resubmit) and the artifact hash for integrity
 * spot-checks. The `id` param (Application lead_id) is just for
 * breadcrumb context back to the application detail.
 */
export default async function AdminDocumentReviewPage({ params }: PageProps) {
  const { id: leadId, req: requestId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return <div className="mx-auto max-w-3xl px-6 py-10">Please log in first.</div>;
  }

  const { admission } = getServerServiceEndpoints();
  const res = await fetch(
    `${admission}/admin/document-requests/${encodeURIComponent(requestId)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (res.status === 403) {
    return <div className="mx-auto max-w-3xl px-6 py-10">Admin access required.</div>;
  }
  if (res.status === 404) notFound();
  const body = (await res.json().catch(() => null)) as Envelope<Detail> | null;
  if (!body?.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[#8b1f1f]">
        Could not load request (status {res.status}).
      </div>
    );
  }

  const { request, artifacts } = body.data;
  const required = request.requiredDocumentTypes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <nav>
        <Link
          href={`/admin/admissions/applications/${encodeURIComponent(leadId)}`}
          className="text-sm text-[var(--ds-primary)] hover:underline"
        >
          ← Back to application
        </Link>
      </nav>

      <header className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          Document request
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
          {request.requestType.replace(/_/g, " ")}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <StatusBadge status={request.status} />
          <span className="text-xs text-[var(--ds-text-secondary)]">
            Student: {request.applicantStudentId}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <KV label="Required" value={required.join(", ") || "—"} />
          <KV label="Requested" value={formatDate(request.requestedAt)} />
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--ds-text-primary)]">
          Uploaded artifacts ({artifacts.length})
        </h2>
        {artifacts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-8 text-center text-sm text-[var(--ds-text-secondary)]">
            No artifacts uploaded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {artifacts.map((a) => (
              <ArtifactReviewRow key={a.documentArtifactId} artifact={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[var(--ds-text-primary)]">{value}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
