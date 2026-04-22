"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Envelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Row = {
  applicantStudentId: string;
  studentName: string;
  studentNumber: string;
  sectionId: string;
  sectionName: string;
  yearGroup: string;
  academicYear: string;
  schoolId: string;
  homeroomTeacherName?: string | null;
  homeroomTeacherEmail?: string | null;
};

/**
 * Parent dashboard card — "My child at school". Only renders when at
 * least one of the parent's kids has been assigned to a Section by
 * admin. Silently hides itself otherwise so pre-enrolment households
 * don't see an empty shell.
 */
export function ParentSectionsCard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const firedRef = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me/sections", { cache: "no-store" });
    const body = (await res.json().catch(() => null)) as Envelope<Row[]> | null;
    // queueMicrotask to keep react-hooks/set-state-in-effect quiet on
    // the fetch-on-mount setState calls.
    queueMicrotask(() => {
      if (!res.ok || !body?.data) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
      } else {
        setRows(body.data);
      }
    });
  }, []);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    void refresh();
  }, [refresh]);

  if (rows === null) return null;
  if (rows.length === 0) return null;

  return (
    <article className="parent-portal-section surface-card rounded-3xl p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          At school
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
          Your child&apos;s class
        </h3>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-[#b42318]/15 bg-[#fee9e9] px-3 py-2 text-sm text-[#8b1f1f]">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div
            key={r.applicantStudentId}
            className="rounded-2xl border border-[#166534]/20 bg-[#e3fcef] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
              {r.schoolId.replace("SCH-", "")} · AY {r.academicYear}
            </p>
            <p className="mt-0.5 text-lg font-semibold text-[#166534]">
              🎓 {r.studentName}
            </p>
            <p className="mt-1 text-sm text-[#166534]">
              {r.sectionName} · {r.yearGroup}
              <span className="ml-2 font-mono text-xs text-[#166534]/80">#{r.studentNumber}</span>
            </p>
            {r.homeroomTeacherName ? (
              <p className="mt-1 text-xs text-[#166534]/90">
                Homeroom teacher: <span className="font-semibold">{r.homeroomTeacherName}</span>
                {r.homeroomTeacherEmail ? (
                  <>
                    {" · "}
                    <a
                      href={`mailto:${r.homeroomTeacherEmail}`}
                      className="underline hover:text-[#166534]"
                    >
                      {r.homeroomTeacherEmail}
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-[#166534]/80">
              Attendance and grades will appear here once the school&apos;s term starts.
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
