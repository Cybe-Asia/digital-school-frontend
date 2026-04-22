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

type AttendanceEntry = {
  applicantStudentId: string;
  studentName: string;
  sectionName: string;
  date: string;
  status: string;
};

type AttendanceSummary = {
  present: number;
  late: number;
  excused: number;
  absent: number;
  total: number;
};

type GradeEntry = {
  applicantStudentId: string;
  studentName: string;
  sectionName: string;
  subject: string;
  term: string;
  score: number;
  maxScore: number;
  recordedAt: string;
};

/**
 * Parent dashboard card — "My child at school". Only renders when at
 * least one of the parent's kids has been assigned to a Section by
 * admin. Silently hides itself otherwise so pre-enrolment households
 * don't see an empty shell.
 */
export function ParentSectionsCard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const firedRef = useRef(false);

  const refresh = useCallback(async () => {
    const [sectionsRes, attendanceRes, gradesRes] = await Promise.all([
      fetch("/api/me/sections", { cache: "no-store" }),
      fetch("/api/me/attendance", { cache: "no-store" }),
      fetch("/api/me/grades", { cache: "no-store" }),
    ]);
    const secBody = (await sectionsRes.json().catch(() => null)) as Envelope<Row[]> | null;
    const attBody = (await attendanceRes.json().catch(() => null)) as Envelope<AttendanceEntry[]> | null;
    const gradeBody = (await gradesRes.json().catch(() => null)) as Envelope<GradeEntry[]> | null;
    queueMicrotask(() => {
      if (!sectionsRes.ok || !secBody?.data) {
        setError(secBody?.responseMessage || `HTTP ${sectionsRes.status}`);
      } else {
        setRows(secBody.data);
      }
      // Downgrade gracefully — section card renders even if sub-calls fail.
      if (attendanceRes.ok && attBody?.data) setAttendance(attBody.data);
      if (gradesRes.ok && gradeBody?.data) setGrades(gradeBody.data);
    });
  }, []);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    void refresh();
  }, [refresh]);

  if (rows === null) return null;
  if (rows.length === 0) return null;

  const summaryFor = (studentId: string): AttendanceSummary => {
    const mine = attendance.filter((a) => a.applicantStudentId === studentId);
    const s: AttendanceSummary = { present: 0, late: 0, excused: 0, absent: 0, total: mine.length };
    for (const a of mine) {
      if (a.status === "present") s.present++;
      else if (a.status === "late") s.late++;
      else if (a.status === "excused") s.excused++;
      else if (a.status === "absent") s.absent++;
    }
    return s;
  };

  const gradesFor = (studentId: string): GradeEntry[] => {
    // Take the 3 most recent grade rows; backend already ordered by
    // recorded_at DESC so slicing from the top keeps ordering correct.
    return grades.filter((g) => g.applicantStudentId === studentId).slice(0, 3);
  };

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
            <AttendanceSummaryRow summary={summaryFor(r.applicantStudentId)} />
            <GradesRow grades={gradesFor(r.applicantStudentId)} />
          </div>
        ))}
      </div>
    </article>
  );
}

/**
 * One-line attendance summary per kid — "5 present · 1 late · 0 absent
 * in the last 14 days" style. Falls back to a placeholder line when no
 * attendance has been recorded yet so parents know to expect it.
 */
function GradesRow({ grades }: { grades: GradeEntry[] }) {
  if (grades.length === 0) return null;
  return (
    <div className="mt-1">
      <p className="text-xs font-semibold text-[#166534]/90">Latest grades</p>
      <ul className="mt-0.5 space-y-0.5">
        {grades.map((g, i) => {
          const pct = g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0;
          return (
            <li key={`${g.subject}-${g.term}-${i}`} className="text-xs text-[#166534]">
              <span className="font-semibold">{g.subject}</span>{" "}
              <span className="text-[#166534]/80">· {g.term}:</span>{" "}
              {g.score} / {g.maxScore}
              <span className="ml-1 text-[#166534]/80">({pct}%)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AttendanceSummaryRow({ summary }: { summary: AttendanceSummary }) {
  if (summary.total === 0) {
    return (
      <p className="mt-2 text-xs text-[#166534]/80">
        Attendance and grades will appear here once the school&apos;s term starts.
      </p>
    );
  }
  const attendedPct = summary.total > 0
    ? Math.round(((summary.present + summary.late) / summary.total) * 100)
    : 0;
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs text-[#166534]/90">
        Attendance (last 14 days):{" "}
        <span className="font-semibold">{summary.present}</span> present
        {summary.late > 0 ? <>, <span className="font-semibold">{summary.late}</span> late</> : null}
        {summary.excused > 0 ? <>, <span className="font-semibold">{summary.excused}</span> excused</> : null}
        {summary.absent > 0 ? <>, <span className="font-semibold text-[#8b1f1f]">{summary.absent}</span> absent</> : null}
        {" · "}
        <span className="font-semibold">{attendedPct}%</span> attended
      </p>
    </div>
  );
}
