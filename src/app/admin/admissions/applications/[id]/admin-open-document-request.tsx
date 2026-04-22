"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  studentId: string;
  leadId: string;
};

const DEFAULT_REQUIRED =
  "birth_certificate,family_card,transcript,photo";

/**
 * Admin CTA: opens a new DocumentRequest for this student with the
 * default pack of required document types. Clicking once creates
 * the request (auto-advances the kid to documents_pending) and
 * navigates to the review page — admin can then watch as the parent
 * uploads.
 */
export function AdminOpenDocumentRequestButton({ studentId, leadId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onClick = async () => {
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/students/${encodeURIComponent(studentId)}/document-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "application_document_pack",
            requiredDocumentTypes: DEFAULT_REQUIRED,
          }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | {
            responseCode?: number;
            responseMessage?: string;
            data?: { documentRequestId: string };
          }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400 || !body?.data) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      startTransition(() =>
        router.push(
          `/admin/admissions/applications/${encodeURIComponent(leadId)}/documents/${encodeURIComponent(body.data!.documentRequestId)}`,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
        Documents
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="rounded-lg border border-[var(--ds-primary)]/40 bg-[var(--ds-primary)]/5 px-3 py-1.5 text-xs font-semibold text-[var(--ds-primary)] hover:bg-[var(--ds-primary)]/10 disabled:opacity-40"
      >
        {isPending ? "Creating…" : "+ Open document request"}
      </button>
      {error ? <p className="text-xs text-[#8b1f1f]">{error}</p> : null}
    </div>
  );
}
