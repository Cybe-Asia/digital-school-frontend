"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/features/admissions-common/status-badge";

type Envelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Artifact = {
  documentArtifactId: string;
  documentType: string;
  fileName: string;
  sizeBytes: number;
  status: string;
  uploadedAt: string;
};

type Request = {
  documentRequestId: string;
  requestType: string;
  requiredDocumentTypes: string; // comma-separated
  status: string;
  dueAt?: string | null;
};

type RequestWithArtifacts = {
  request: Request;
  artifacts: Artifact[];
  studentId: string;
  studentName: string;
};

/**
 * Fetches every DocumentRequest across every kid the parent owns and
 * renders an upload panel per requested document_type.
 *
 * UI: one card per (student × request). Inside each card, one row per
 * required document type, showing either the already-uploaded artifact
 * or an inline file picker + upload button.
 */
export function ParentDocumentsClient() {
  const { t } = useI18n();
  const [rows, setRows] = useState<RequestWithArtifacts[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Strict-mode double-mount guard so we don't double-fetch in dev.
  const firedRef = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me/document-requests", { cache: "no-store" });
    const body = (await res.json().catch(() => null)) as Envelope<RequestWithArtifacts[]> | null;
    if (!res.ok || !body?.data) {
      setLoadError(body?.responseMessage || `HTTP ${res.status}`);
      return;
    }
    setRows(body.data);
  }, []);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    // Fire-and-forget on mount. `refresh` does its own setState
    // inside an awaited branch (never synchronously), so this effect
    // body itself never calls setState.
    void refresh();
  }, [refresh]);

  if (loadError) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {loadError}
      </div>
    );
  }
  if (rows === null) {
    return <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.documents.loading")}</p>;
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-8 text-sm">
        <p className="font-semibold text-[var(--ds-text-primary)]">
          {t("auth.documents.empty_title")}
        </p>
        <p className="mt-1 text-[var(--ds-text-secondary)]">
          {t("auth.documents.empty_description")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {rows.map((row) => (
        <RequestCard key={row.request.documentRequestId} row={row} onRefresh={refresh} />
      ))}
    </div>
  );
}

function RequestCard({ row, onRefresh }: { row: RequestWithArtifacts; onRefresh: () => void }) {
  const { t } = useI18n();
  const requiredTypes = row.request.requiredDocumentTypes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const byType = new Map<string, Artifact>();
  for (const a of row.artifacts) byType.set(a.documentType, a);

  return (
    <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            {t("auth.documents.card_for_student")}
          </p>
          <h3 className="mt-0.5 text-lg font-semibold text-[var(--ds-text-primary)]">
            {row.studentName}
          </h3>
        </div>
        <StatusBadge status={row.request.status} />
      </div>

      <div className="mt-4 space-y-3">
        {requiredTypes.map((docType) => (
          <DocumentRow
            key={docType}
            docType={docType}
            requestId={row.request.documentRequestId}
            artifact={byType.get(docType)}
            onUploaded={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}

function DocumentRow({
  docType,
  requestId,
  artifact,
  onUploaded,
}: {
  docType: string;
  requestId: string;
  artifact: Artifact | undefined;
  onUploaded: () => void;
}) {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = docType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const onUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("document_request_id", requestId);
      form.append("document_type", docType);
      form.append("file", file);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: form,
      });
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        setUploading(false);
        return;
      }
      setFile(null);
      setUploading(false);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{label}</p>
          {artifact ? (
            <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
              {artifact.fileName} &middot; {formatKb(artifact.sizeBytes)} &middot;
              uploaded {formatDate(artifact.uploadedAt)}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
              {t("auth.documents.not_uploaded")}
            </p>
          )}
        </div>
        {artifact ? <StatusBadge status={artifact.status} size="sm" /> : null}
      </div>

      {!artifact || artifact.status === "rejected" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs"
            disabled={uploading}
          />
          <Button
            type="button"
            disabled={!file || uploading}
            onClick={onUpload}
            className="px-3 py-1.5 text-xs"
          >
            {uploading ? t("auth.documents.uploading") : t("auth.documents.upload_cta")}
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-[#8b1f1f]">{error}</p>
      ) : null}
    </div>
  );
}

function formatKb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
