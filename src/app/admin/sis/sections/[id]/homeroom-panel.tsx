"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/app/admin/toast";

const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]";

export function HomeroomPanel({
  sectionId,
  initialName,
  initialEmail,
}: {
  sectionId: string;
  initialName: string | null | undefined;
  initialEmail: string | null | undefined;
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/admin/sis/sections/${encodeURIComponent(sectionId)}/homeroom`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name || null, email: email || null }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        toast.error(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success("Homeroom teacher updated");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <form
      onSubmit={save}
      className="grid grid-cols-1 gap-2 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 sm:grid-cols-3"
    >
      <div className="sm:col-span-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Homeroom teacher
        </h2>
        <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
          Free-text for now — shown on the parent&apos;s &quot;my child at school&quot; card.
          Will become a proper Teacher node in a later sprint.
        </p>
      </div>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={INPUT_CLS}
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={INPUT_CLS}
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        Save
      </button>
    </form>
  );
}
