"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/app/admin/toast";

const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]";

export function CreateSectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({
    school_id: "SCH-IISS",
    name: "",
    year_group: "",
    academic_year: new Date().getFullYear().toString(),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/sis/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        toast.error(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success(`Section "${state.name}" created`);
      setState({ ...state, name: "", year_group: "" });
      // If the admin created a section in a different school than the
      // current list filter, switch the filter so the new row is
      // visible. An empty `school` filter means "all schools" — in
      // that case refresh is enough. Same pattern as tests/schedules.
      startTransition(() => {
        const currentSchool = searchParams.get("school") ?? "";
        if (currentSchool && currentSchool !== state.school_id) {
          const next = new URLSearchParams(searchParams.toString());
          next.set("school", state.school_id);
          router.push(`/admin/sis/sections?${next.toString()}`);
        } else {
          router.refresh();
        }
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 gap-2 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3 sm:grid-cols-5"
    >
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">Name</p>
        <input
          required
          placeholder="Grade 7A"
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">School</p>
        <select
          value={state.school_id}
          onChange={(e) => setState({ ...state, school_id: e.target.value })}
          className={INPUT_CLS}
        >
          <option value="SCH-IIHS">IIHS</option>
          <option value="SCH-IISS">IISS</option>
        </select>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">Year group</p>
        <input
          required
          placeholder="Grade 7"
          value={state.year_group}
          onChange={(e) => setState({ ...state, year_group: e.target.value })}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">Academic year</p>
        <input
          required
          value={state.academic_year}
          onChange={(e) => setState({ ...state, academic_year: e.target.value })}
          className={INPUT_CLS}
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          + Create section
        </button>
      </div>
    </form>
  );
}
