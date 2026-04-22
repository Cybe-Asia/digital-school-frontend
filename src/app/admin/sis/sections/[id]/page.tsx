import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { AssignStudentsPanel } from "./assign-panel";
import { HomeroomPanel } from "./homeroom-panel";
import { AttendancePanel } from "./attendance-panel";
import { GradesPanel } from "./grades-panel";

export const metadata: Metadata = { title: "Section Detail | Admin" };

const SESSION_COOKIE_NAME = "ds-session";
type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Detail = {
  section: {
    sectionId: string;
    schoolId: string;
    name: string;
    yearGroup: string;
    academicYear: string;
    status: string;
    enrolledCount: number;
    homeroomTeacherName?: string | null;
    homeroomTeacherEmail?: string | null;
  };
  members: Array<{
    applicantStudentId: string;
    studentNumber: string;
    fullName: string;
    yearGroup?: string | null;
    parentName: string;
    parentEmail: string;
  }>;
};

type EnrolledRow = {
  studentId: string;
  studentNumber: string;
  schoolId: string;
  yearGroup?: string | null;
  status: string;
  enrolmentDate: string;
  applicantStudentId: string;
  fullName: string;
  parentName: string;
  parentEmail: string;
};

export default async function AdminSectionDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return <div className="mx-auto max-w-3xl px-6 py-10 text-sm">Please log in first.</div>;

  const { admission } = getServerServiceEndpoints();
  let payload: ApiEnvelope<Detail> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/sis/sections/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<Detail> | null;
  } catch {
    // upstream down
  }
  if (httpStatus === 403) return <div className="mx-auto max-w-3xl px-6 py-10 text-sm"><h1 className="text-xl font-semibold">Admin access required</h1></div>;
  if (!payload?.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold">Section not found</h1>
        <p className="mt-2 text-[var(--ds-text-secondary)]">{payload?.responseMessage || `HTTP ${httpStatus}`}</p>
        <Link href="/admin/sis/sections" className="mt-3 inline-block text-sm text-[var(--ds-primary)]">← Back</Link>
      </div>
    );
  }

  const { section, members } = payload.data;

  // Build pool of enrolled kids matching the section's school + year so
  // admin can pick from a narrow list. Filter server-side for scale.
  const poolQs = new URLSearchParams();
  poolQs.set("school", section.schoolId);
  poolQs.set("yearGroup", section.yearGroup);
  poolQs.set("status", "active");
  poolQs.set("limit", "200");
  let pool: EnrolledRow[] = [];
  try {
    const r = await fetch(`${admission}/admin/enrolled?${poolQs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const p = (await r.json().catch(() => null)) as ApiEnvelope<{ rows: EnrolledRow[] }> | null;
    pool = p?.data?.rows ?? [];
  } catch {
    // empty pool is fine
  }
  const memberSet = new Set(members.map((m) => m.applicantStudentId));
  const unassigned = pool.filter((e) => !memberSet.has(e.applicantStudentId));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <nav className="mb-3 text-xs">
        <Link href="/admin/sis/sections" className="text-[var(--ds-primary)] hover:underline">
          ← Back to sections
        </Link>
      </nav>

      <header className="mb-4 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
              Section
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">{section.name}</h1>
            <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
              {section.schoolId} · {section.yearGroup} · AY {section.academicYear}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={section.status} size="sm" />
            <span className="text-xs text-[var(--ds-text-secondary)]">{members.length} enrolled</span>
          </div>
        </div>
      </header>

      <HomeroomPanel
        sectionId={section.sectionId}
        initialName={section.homeroomTeacherName}
        initialEmail={section.homeroomTeacherEmail}
      />

      <div className="mt-6">
        <AssignStudentsPanel
          sectionId={section.sectionId}
          unassigned={unassigned}
        />
      </div>

      <div className="mt-6">
        <AttendancePanel sectionId={section.sectionId} />
      </div>

      <div className="mt-6">
        <GradesPanel sectionId={section.sectionId} />
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Members
        </h2>
        {members.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">
            No students assigned yet. Use the panel above to add them from the pool of enrolled students in this year group.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {members.map((m) => (
              <li
                key={m.applicantStudentId}
                className="flex items-center justify-between rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/30 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-[var(--ds-text-primary)]">
                    {m.fullName} <span className="ml-1 font-mono text-xs text-[var(--ds-text-secondary)]">#{m.studentNumber}</span>
                  </p>
                  <p className="text-xs text-[var(--ds-text-secondary)]">{m.parentName} · {m.parentEmail}</p>
                </div>
                <Link
                  href={`/admin/admissions/students/${encodeURIComponent(m.applicantStudentId)}`}
                  className="text-xs text-[var(--ds-primary)] hover:underline"
                >
                  Open applicant →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
