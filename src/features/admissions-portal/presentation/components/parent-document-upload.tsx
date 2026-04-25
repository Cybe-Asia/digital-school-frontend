"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { Tile } from "@/components/parent-ui";
import { CheckCircleIcon, DocIcon } from "@/components/parent-ui/icons";

type ArtifactEnvelope = {
  documentArtifactId: string;
  documentType: string;
  fileName?: string | null;
  mimeType?: string | null;
  reviewStatus?: string | null;
};

type RequestGroup = {
  requestId: string;
  studentId: string;
  studentName: string;
  requiredDocumentTypes: string[];
  artifacts: ArtifactEnvelope[];
};

type ParentDocumentUploadProps = {
  /** Filter to only show document requests for this student (optional —
   *  when omitted we show every kid the parent owns). */
  studentId?: string;
};

type BackendEnvelope = {
  data?: Array<{
    request?: { documentRequestId?: string; requiredDocumentTypes?: string };
    artifacts?: Array<ArtifactEnvelope>;
    studentId?: string;
    studentName?: string;
  }>;
};

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "success"; fileName: string }
  | { kind: "error"; reason: string };

/**
 * Real document upload UI. POSTs multipart/form-data to
 * `/api/me/document-requests` which the Next.js proxy forwards
 * unchanged to admission-service, which stores the binary in MinIO
 * and writes a `:DocumentArtifact` node under the parent's
 * `:DocumentRequest`.
 *
 * One row per required document type per student. Uploading a file
 * for a type flips its row to "success" and refreshes so the admin
 * review page picks it up. We do NOT mock-complete uploads; the
 * state reflects what the backend confirms.
 */
export function ParentDocumentUpload({ studentId }: ParentDocumentUploadProps) {
  const { t } = useI18n();
  const [groups, setGroups] = useState<RequestGroup[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Upload state keyed by `${requestId}:${documentType}`.
  const [states, setStates] = useState<Record<string, UploadState>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me/document-requests", { cache: "no-store" });
        const body = (await res.json().catch(() => null)) as BackendEnvelope | null;
        if (!res.ok || !body?.data) {
          if (!cancelled) setLoadError(`HTTP ${res.status}`);
          return;
        }
        const mapped: RequestGroup[] = body.data
          .filter((row) => (studentId ? row.studentId === studentId : true))
          .map((row) => ({
            requestId: row.request?.documentRequestId ?? "",
            studentId: row.studentId ?? "",
            studentName: row.studentName ?? "",
            requiredDocumentTypes: (row.request?.requiredDocumentTypes ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            artifacts: row.artifacts ?? [],
          }))
          .filter((g) => g.requestId && g.requiredDocumentTypes.length > 0);
        if (!cancelled) setGroups(mapped);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const keyFor = (requestId: string, docType: string) => `${requestId}:${docType}`;

  const setState = (key: string, state: UploadState) =>
    setStates((s) => ({ ...s, [key]: state }));

  const handleFile = async (
    requestId: string,
    docType: string,
    file: File,
  ) => {
    const key = keyFor(requestId, docType);
    setState(key, { kind: "uploading", progress: 0 });

    const fd = new FormData();
    fd.append("document_request_id", requestId);
    fd.append("document_type", docType);
    fd.append("file", file, file.name);

    try {
      const res = await fetch("/api/me/document-requests", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || body?.responseCode >= 400) {
        setState(key, {
          kind: "error",
          reason: body?.responseMessage ?? body?.responseError ?? `HTTP ${res.status}`,
        });
        return;
      }
      setState(key, { kind: "success", fileName: file.name });
      // Refresh the parent page so the server-side document list picks
      // up the new artifact on next render.
      if (typeof window !== "undefined") {
        window.setTimeout(() => window.location.reload(), 900);
      }
    } catch (err) {
      setState(key, {
        kind: "error",
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  };

  if (loadError) {
    return (
      <Tile variant="flat">
        <p className="text-[15px] leading-relaxed text-[color:var(--warm-coral,#c24d4d)]">
          {t("parent.documents.load_error", { reason: loadError })}
        </p>
      </Tile>
    );
  }
  if (groups === null) {
    return (
      <Tile variant="flat">
        <p className="text-[15px] leading-relaxed text-[color:var(--ink-500)]">
          {t("parent.documents.loading")}
        </p>
      </Tile>
    );
  }
  if (groups.length === 0) {
    return (
      <Tile variant="flat">
        <p className="text-[15px] leading-relaxed text-[color:var(--ink-500)]">
          {t("parent.documents.empty")}
        </p>
      </Tile>
    );
  }

  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <section key={group.requestId}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
            {t("parent.documents.for_student", { name: group.studentName })}
          </p>
          <div className="mt-3 grid gap-3">
            {group.requiredDocumentTypes.map((docType) => {
              const key = keyFor(group.requestId, docType);
              const existing = group.artifacts.find((a) => a.documentType === docType);
              const state = states[key] ?? { kind: "idle" };
              return (
                <DocumentRow
                  key={key}
                  docType={docType}
                  existing={existing}
                  state={state}
                  onFile={(f) => handleFile(group.requestId, docType, f)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function DocumentRow({
  docType,
  existing,
  state,
  onFile,
}: {
  docType: string;
  existing: ArtifactEnvelope | undefined;
  state: UploadState;
  onFile: (file: File) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const uploaded = Boolean(existing) || state.kind === "success";
  const label = t(`parent.documents.type.${docType}`) || docType;
  const fileName =
    state.kind === "success" ? state.fileName : (existing?.fileName ?? null);

  const previewUrl = existing?.documentArtifactId
    ? `/api/me/documents/${encodeURIComponent(existing.documentArtifactId)}/download`
    : null;
  const isImage = (existing?.mimeType ?? "").startsWith("image/");
  const isPdf = (existing?.mimeType ?? "") === "application/pdf";

  const openPreview = () => dialogRef.current?.showModal();
  const closePreview = () => dialogRef.current?.close();

  return (
    <Tile variant={uploaded ? "flat" : "default"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              uploaded
                ? "bg-[color:var(--brand-wash)] text-[color:var(--brand-strong)]"
                : "bg-[color:var(--ink-100,#f0ece6)] text-[color:var(--ink-500)]"
            }`}
            aria-hidden="true"
          >
            <span className="h-5 w-5">{uploaded ? <CheckCircleIcon /> : <DocIcon />}</span>
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[color:var(--ink-900)]">
              {label}
            </p>
            {fileName ? (
              <p className="mt-0.5 truncate text-xs text-[color:var(--ink-500)]">
                {fileName}
                {existing?.reviewStatus ? ` · ${t(
                  `parent.documents.review.${existing.reviewStatus}`,
                ) || existing.reviewStatus}` : ""}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-[color:var(--ink-500)]">
                {t("parent.documents.required_helper")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state.kind === "uploading" ? (
            <span className="text-xs font-medium text-[color:var(--ink-500)]">
              {t("parent.documents.uploading")}
            </span>
          ) : null}
          {state.kind === "error" ? (
            <span className="text-xs text-[color:var(--warm-coral,#c24d4d)]" role="alert">
              {state.reason}
            </span>
          ) : null}

          {previewUrl ? (
            <button
              type="button"
              className="parent-ghost-btn w-auto px-4 py-2 text-sm"
              onClick={openPreview}
            >
              {t("parent.documents.preview_cta")}
            </button>
          ) : null}

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              // Reset value so the same file can be re-selected if needed.
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="parent-ghost-btn w-auto px-4 py-2 text-sm"
            onClick={() => inputRef.current?.click()}
            disabled={state.kind === "uploading"}
          >
            {uploaded
              ? t("parent.documents.replace_cta")
              : t("parent.documents.upload_cta")}
          </button>
        </div>
      </div>

      {/* Inline preview modal. Native <dialog> gives us focus-trap +
          escape-to-close + backdrop click semantics for free. We render
          <img> for image MIME types and <iframe> for PDFs; anything
          else (rare) falls back to a download link. The dialog is
          rendered for every row with an existing artifact so the
          render order is stable; .showModal() is what makes it
          actually visible. */}
      {previewUrl ? (
        <dialog
          ref={dialogRef}
          className="parent-doc-preview-dialog"
          onClick={(e) => {
            // Backdrop click closes — the dialog element itself is the
            // backdrop target when the click misses inner content.
            if (e.target === dialogRef.current) closePreview();
          }}
        >
          <div className="parent-doc-preview-dialog__inner">
            <header className="parent-doc-preview-dialog__header">
              <p className="text-sm font-semibold text-[color:var(--ink-900)] truncate">
                {label}
                {fileName ? <span className="text-[color:var(--ink-500)] font-normal"> · {fileName}</span> : null}
              </p>
              <button
                type="button"
                onClick={closePreview}
                className="parent-doc-preview-dialog__close"
                aria-label={t("parent.documents.preview_close") || "Close"}
              >
                ×
              </button>
            </header>
            <div className="parent-doc-preview-dialog__body">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={label} />
              ) : isPdf ? (
                <iframe src={previewUrl} title={label} />
              ) : (
                <p className="text-sm text-[color:var(--ink-500)] p-6">
                  {t("parent.documents.preview_unsupported") ||
                    "Preview not supported for this file type."}
                </p>
              )}
            </div>
            <footer className="parent-doc-preview-dialog__footer">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="parent-ghost-btn w-auto px-4 py-2 text-sm"
                download={fileName ?? undefined}
              >
                {t("parent.documents.preview_download") || "Download"}
              </a>
            </footer>
          </div>
        </dialog>
      ) : null}
    </Tile>
  );
}
