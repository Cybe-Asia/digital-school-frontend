"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/app/admin/toast";

type Envelope<T> = { responseCode: number; responseMessage: string; data?: T };
type Row = {
  applicantStudentId: string;
  studentNumber: string;
  fullName: string;
  score: number | null;
  maxScore: number | null;
  recordedAt?: string | null;
  recordedBy?: string | null;
};

/**
 * (subject × term) grade recorder. Admin picks a subject + term,
 * roster loads with existing scores pre-filled, admin types new
 * scores inline, saves the batch. Score clamped client-side to
 * [0, maxScore]; backend re-validates.
 */
export function GradesPanel({ sectionId }: { sectionId: string }) {
  const toast = useToast();
  const [subject, setSubject] = useState("Math");
  const [term, setTerm] = useState("Term 1");
  const [defaultMax, setDefaultMax] = useState(100);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [dirty, setDirty] = useState<Map<string, { score: number; maxScore: number }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const firedRef = useRef(false);

  const load = useCallback(async () => {
    if (!subject.trim() || !term.trim()) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ subject, term });
      const res = await fetch(
        `/api/admin/sis/sections/${encodeURIComponent(sectionId)}/grades?${qs.toString()}`,
        { cache: "no-store" },
      );
      const body = (await res.json().catch(() => null)) as
        | Envelope<{ sectionId: string; subject: string; term: string; rows: Row[] }>
        | null;
      queueMicrotask(() => {
        if (!res.ok || !body?.data) {
          toast.error(body?.responseMessage || `HTTP ${res.status}`);
          setRows([]);
        } else {
          setRows(body.data.rows);
        }
        setDirty(new Map());
        setLoading(false);
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }, [sectionId, subject, term, toast]);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    void load();
  }, [load]);

  const set = (id: string, score: number, maxScore: number) => {
    const s = Math.max(0, Math.min(maxScore, isFinite(score) ? score : 0));
    const next = new Map(dirty);
    next.set(id, { score: s, maxScore });
    setDirty(next);
  };

  const effective = (r: Row): { score: number; maxScore: number } | null => {
    const d = dirty.get(r.applicantStudentId);
    if (d) return d;
    if (r.score != null && r.maxScore != null) return { score: r.score, maxScore: r.maxScore };
    return null;
  };

  const save = async () => {
    if (!rows) return;
    const entries = Array.from(dirty.entries()).map(([id, v]) => ({
      applicantStudentId: id,
      score: v.score,
      maxScore: v.maxScore,
      notes: null,
    }));
    if (entries.length === 0) {
      toast.info("No changes to save");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/sis/sections/${encodeURIComponent(sectionId)}/grades`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, term, entries }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | Envelope<{ requested: number; saved: number }>
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        toast.error(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success(`Saved ${body?.data?.saved ?? "?"} / ${body?.data?.requested ?? "?"} grades (${subject} · ${term})`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            Grades
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
            One (subject × term) pass per save. Score auto-clamps to [0, max].
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-28 rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5"
          />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Term"
            className="w-28 rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5"
          />
          <input
            type="number"
            value={defaultMax}
            onChange={(e) => setDefaultMax(parseFloat(e.target.value || "100"))}
            min={1}
            className="w-20 rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5"
            title="Default max score for newly-entered rows"
          />
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm font-semibold text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
          >
            Load
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-[var(--ds-text-secondary)]">Loading roster…</p>
      ) : rows === null ? null : rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ds-text-secondary)]">
          No students in this section.
        </p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {rows.map((r) => {
            const eff = effective(r);
            const max = eff?.maxScore ?? r.maxScore ?? defaultMax;
            const score = eff?.score ?? r.score ?? "";
            const isDirty = dirty.has(r.applicantStudentId);
            return (
              <li
                key={r.applicantStudentId}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                  isDirty ? "border-[var(--ds-primary)]/30 bg-[var(--ds-primary)]/5" : "border-[var(--ds-border)] bg-[var(--ds-soft)]/20"
                }`}
              >
                <div>
                  <p className="font-semibold text-[var(--ds-text-primary)]">
                    {r.fullName}{" "}
                    <span className="font-mono text-xs text-[var(--ds-text-secondary)]">#{r.studentNumber}</span>
                  </p>
                  {r.recordedAt && !isDirty ? (
                    <p className="text-[11px] text-[var(--ds-text-secondary)]">
                      last saved {formatDateTime(r.recordedAt)}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <input
                    type="number"
                    min={0}
                    max={max}
                    step={0.01}
                    value={score}
                    onChange={(e) => set(r.applicantStudentId, parseFloat(e.target.value), max)}
                    className="w-16 rounded-md border border-[var(--ds-border)] bg-[var(--ds-surface)] px-1.5 py-1 text-right"
                  />
                  <span className="text-[var(--ds-text-secondary)]">/</span>
                  <input
                    type="number"
                    min={1}
                    value={max}
                    onChange={(e) => set(r.applicantStudentId, typeof score === "number" ? score : 0, parseFloat(e.target.value || "100"))}
                    className="w-14 rounded-md border border-[var(--ds-border)] bg-[var(--ds-surface)] px-1.5 py-1 text-right"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rows && rows.length > 0 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-[var(--ds-text-secondary)]">
            {dirty.size > 0 ? `${dirty.size} change${dirty.size === 1 ? "" : "s"} pending` : "No pending changes"}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={saving || dirty.size === 0}
            className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save grades"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
