"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/app/admin/toast";

export function CancelOfferButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const cancel = async () => {
    if (!window.confirm("Cancel this offer? The applicant rolls back to documents_verified.")) return;
    try {
      const res = await fetch(
        `/api/admin/offers/${encodeURIComponent(offerId)}/cancel`,
        { method: "POST" },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        toast.error(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success("Offer cancelled");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={isPending}
      className="rounded-lg border border-[#b42318]/30 bg-[#fee9e9]/60 px-2 py-1 text-xs font-semibold text-[#8b1f1f] hover:bg-[#fee9e9] disabled:opacity-40"
    >
      Cancel
    </button>
  );
}
