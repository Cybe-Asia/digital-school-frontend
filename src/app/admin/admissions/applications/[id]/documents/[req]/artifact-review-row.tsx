"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusBadge } from "@/features/admissions-common/status-badge";

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

const REVIEW_OPTIONS = [
  { value: "approved", label: "Approve" },
  { value: "rejected", label: "Reject" },
  { value: "resubmission_required", label: "Request resubmit" },
];

/**
 * One admin card per uploaded DocumentArtifact. Includes:
 *  - file info + SHA-256 hash (first 12 chars for readability)
 *  - "Open file" button that fetches a short-lived presigned URL
 *    and opens it in a new tab
 *  - Review form (status + notes + Save)
 */
export function ArtifactReviewRow({ artifact }: { artifact: Artifact }) {
  const router = useRouter();
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openingFile, setOpeningFile] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onOpenFile = async () => {
    setOpeningFile(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/documents/${encodeURIComponent(artifact.documentArtifactId)}/download`,
        { cache: "no-store" },
      );
      const body = (await res.json().catch(() => null)) as {
        data?: { presignedUrl: string };
        responseMessage?: string;
      } | null;
      if (!res.ok || !body?.data?.presignedUrl) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        setOpeningFile(false);
        return;
      }
      window.open(body.data.presignedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setOpeningFile(false);
    }
  };

  const onSaveReview = async () => {
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/document-artifacts/${encodeURIComponent(artifact.documentArtifactId)}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: reviewStatus, reviewNotes: notes || null }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const typeLabel = artifact.documentType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            {typeLabel}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-[var(--ds-text-primary)]">
            {artifact.fileName}
          </p>
          <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
            {artifact.mimeType} &middot; {formatSize(artifact.sizeBytes)} &middot;
            sha256:{artifact.documentHash.slice(0, 12)}…
          </p>
        </div>
        <StatusBadge status={artifact.status} size="sm" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenFile}
          disabled={openingFile}
          className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
        >
          {openingFile ? "Opening…" : "Open file ↗"}
        </button>
      </div>

      <div className="mt-4 border-t border-[var(--ds-border)] pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Record review
        </p>
        <div className="mt-2 flex flex-wrap items-start gap-2">
          <select
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value)}
            className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-xs"
          >
            {REVIEW_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <textarea
            rows={2}
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-w-[200px] flex-1 rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={onSaveReview}
            disabled={isPending}
            className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Save review"}
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-xs text-[#8b1f1f]">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
