"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Candidate = {
  applicantStudentId: string;
  studentNumber: string;
  fullName: string;
  parentName: string;
  parentEmail: string;
};

export function AssignStudentsPanel({
  sectionId,
  unassigned,
}: {
  sectionId: string;
  unassigned: Candidate[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return unassigned;
    return unassigned.filter((c) =>
      c.fullName.toLowerCase().includes(q) ||
      c.studentNumber.toLowerCase().includes(q) ||
      c.parentName.toLowerCase().includes(q) ||
      c.parentEmail.toLowerCase().includes(q),
    );
  }, [unassigned, search]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const submit = async () => {
    setErr(null); setOk(null);
    if (selected.size === 0) {
      setErr("Select at least one student");
      return;
    }
    try {
      const res = await fetch(
        `/api/admin/sis/sections/${encodeURIComponent(sectionId)}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicant_student_ids: Array.from(selected) }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string; data?: { requested: number; assigned: number } }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setErr(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      setOk(`Assigned ${body?.data?.assigned ?? "?"} / ${body?.data?.requested ?? "?"} students`);
      setSelected(new Set());
      startTransition(() => router.refresh());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
        Assign enrolled students
      </h2>
      <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
        Pool: enrolled students matching this section&apos;s school + year group,
        not yet assigned to any section.
      </p>

      {unassigned.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">
          Nobody to assign. Either everyone eligible is already in a section, or
          no students have been handed to SIS for {" "}
          <span className="font-semibold">this school + year group</span> yet.
        </p>
      ) : (
        <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${unassigned.length} unassigned…`}
            className="mt-3 w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm"
          />

          <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
            {filtered.map((c) => {
              const checked = selected.has(c.applicantStudentId);
              return (
                <li
                  key={c.applicantStudentId}
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-sm ${
                    checked
                      ? "border-[var(--ds-primary)]/40 bg-[var(--ds-primary)]/5"
                      : "border-[var(--ds-border)] bg-[var(--ds-soft)]/20"
                  }`}
                >
                  <label className="flex flex-1 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(c.applicantStudentId)}
                    />
                    <span className="font-semibold text-[var(--ds-text-primary)]">
                      {c.fullName}
                    </span>
                    <span className="font-mono text-xs text-[var(--ds-text-secondary)]">
                      #{c.studentNumber}
                    </span>
                  </label>
                  <span className="text-xs text-[var(--ds-text-secondary)]">
                    {c.parentName} · {c.parentEmail}
                  </span>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-2 py-3 text-sm text-[var(--ds-text-secondary)]">No matches.</li>
            ) : null}
          </ul>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-[var(--ds-text-secondary)]">
              {selected.size} selected
            </p>
            <button
              type="button"
              disabled={isPending || selected.size === 0}
              onClick={submit}
              className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              Assign {selected.size > 0 ? selected.size : ""} → section
            </button>
          </div>
        </>
      )}

      {err ? <p className="mt-2 text-xs text-[#8b1f1f]">{err}</p> : null}
      {ok ? <p className="mt-2 text-xs text-[#166534]">{ok}</p> : null}
    </section>
  );
}
