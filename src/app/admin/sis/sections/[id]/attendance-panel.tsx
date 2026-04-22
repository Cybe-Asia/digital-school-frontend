"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/app/admin/toast";

type Envelope<T> = { responseCode: number; responseMessage: string; data?: T };
type Row = {
  applicantStudentId: string;
  studentNumber: string;
  fullName: string;
  status: string | null;
  notes: string | null;
  recordedAt?: string | null;
  recordedBy?: string | null;
};

const STATUSES = ["present", "late", "excused", "absent"] as const;
type Status = (typeof STATUSES)[number];

/**
 * Day-scoped attendance recorder. Admin picks a date, the panel fetches
 * the section's roster for that date (with any existing statuses pre-
 * filled), lets the admin flip each student's status with one click,
 * then saves the whole batch.
 *
 * Saves are idempotent on the backend — replaying the same day with
 * updated statuses overwrites cleanly.
 */
export function AttendancePanel({ sectionId }: { sectionId: string }) {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [dirty, setDirty] = useState<Map<string, Status>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const firedRef = useRef(false);

  const load = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/sis/sections/${encodeURIComponent(sectionId)}/attendance?date=${encodeURIComponent(d)}`,
        { cache: "no-store" },
      );
      const body = (await res.json().catch(() => null)) as
        | Envelope<{ sectionId: string; date: string; rows: Row[] }>
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
  }, [sectionId, toast]);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    void load(date);
  }, [date, load]);

  const onChangeDate = (d: string) => {
    setDate(d);
    void load(d);
  };

  const set = (id: string, s: Status) => {
    const next = new Map(dirty);
    next.set(id, s);
    setDirty(next);
  };

  const effective = (r: Row): Status | null => {
    const d = dirty.get(r.applicantStudentId);
    if (d) return d;
    if (r.status && (STATUSES as readonly string[]).includes(r.status)) return r.status as Status;
    return null;
  };

  const markAll = (s: Status) => {
    if (!rows) return;
    const next = new Map(dirty);
    for (const r of rows) next.set(r.applicantStudentId, s);
    setDirty(next);
  };

  const save = async () => {
    if (!rows) return;
    // Only POST rows whose effective status differs from the loaded one.
    const entries = rows
      .filter((r) => {
        const eff = effective(r);
        return eff != null && eff !== r.status;
      })
      .map((r) => ({
        applicantStudentId: r.applicantStudentId,
        status: effective(r)!,
        notes: null,
      }));
    if (entries.length === 0) {
      toast.info("No changes to save");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/sis/sections/${encodeURIComponent(sectionId)}/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, entries }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | Envelope<{ requested: number; saved: number; date: string }>
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        toast.error(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success(`Saved ${body?.data?.saved ?? "?"} / ${body?.data?.requested ?? "?"} for ${date}`);
      await load(date);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            Attendance
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
            Roster for one day. Pre-fills existing statuses; saves are idempotent.
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => onChangeDate(e.target.value)}
          className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]"
        />
      </div>

      {rows && rows.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => markAll(s)}
              className="rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
            >
              Mark all {s}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-[var(--ds-text-secondary)]">Loading roster…</p>
      ) : rows === null ? null : rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ds-text-secondary)]">
          No students assigned to this section. Assign some first.
        </p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {rows.map((r) => {
            const eff = effective(r);
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
                <div className="flex items-center gap-1">
                  {STATUSES.map((s) => {
                    const active = eff === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set(r.applicantStudentId, s)}
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          active ? colorFor(s) : "border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text-secondary)] hover:bg-[var(--ds-soft)]"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
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
            {saving ? "Saving…" : "Save attendance"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function colorFor(s: Status): string {
  switch (s) {
    case "present": return "border-[#166534]/40 bg-[#e3fcef] text-[#166534]";
    case "late":    return "border-[#b45309]/40 bg-[#fef3c7] text-[#92400e]";
    case "excused": return "border-[#1d4ed8]/40 bg-[#dbeafe] text-[#1d4ed8]";
    case "absent":  return "border-[#b42318]/40 bg-[#fee9e9] text-[#8b1f1f]";
  }
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
