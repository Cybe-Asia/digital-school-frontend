"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CancelOfferButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const cancel = async () => {
    if (!window.confirm("Cancel this offer? The applicant rolls back to documents_verified.")) return;
    setErr(null);
    try {
      const res = await fetch(
        `/api/admin/offers/${encodeURIComponent(offerId)}/cancel`,
        { method: "POST" },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setErr(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={cancel}
        disabled={isPending}
        className="rounded-lg border border-[#b42318]/30 bg-[#fee9e9]/60 px-2 py-1 text-xs font-semibold text-[#8b1f1f] hover:bg-[#fee9e9] disabled:opacity-40"
      >
        Cancel
      </button>
      {err ? <p className="mt-1 text-xs text-[#8b1f1f]">{err}</p> : null}
    </>
  );
}
