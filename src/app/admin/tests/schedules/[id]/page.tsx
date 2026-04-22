import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { SessionRow, type SessionCardResult, type SessionCardSession } from "./session-row";
import { ScheduleActions } from "./schedule-actions";

export const metadata: Metadata = { title: "Schedule detail | Admin" };

const SESSION_COOKIE_NAME = "ds-session";
type Envelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Schedule = {
  testScheduleId: string;
  schoolId: string;
  scheduleType: string;
  testLocation: string;
  scheduledDate: string;
  timeslotStart: string;
  timeslotEnd: string;
  capacity: number;
  bookedCount: number;
  status: string;
};

type ApplicationSummary = {
  lead: { admissionId: string; parentName: string; email: string };
  students: Array<{ studentId: string; fullName: string; applicantStatus?: string }>;
};

type TestResult = {
  applicantStudentId: string;
  resultStatus?: string;
  scoreTotal?: number | null;
  reviewOutcome?: string | null;
  reviewNotes?: string | null;
};

type PageProps = { params: Promise<{ id: string }> };

/**
 * Admin schedule detail — lists every session booked against this
 * schedule and lets staff mark attendance + record results. The page
 * is server-rendered for freshness; each session card is a client
 * component that mutates via proxy + router.refresh().
 *
 * We also server-side-fetch the full admin applications list once to
 * map applicant_student_id → parent/student display name. This is a
 * small O(N*M) loop locally; with sensible school sizes (<500
 * applications) it's fine without pagination.
 */
export default async function AdminScheduleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return <div className="mx-auto max-w-3xl px-6 py-10">Please log in first.</div>;
  }

  const { admission } = getServerServiceEndpoints();
  const auth = { Authorization: `Bearer ${token}` };

  const [scheduleRes, sessionsRes, appsRes] = await Promise.all([
    fetch(`${admission}/admin/tests/schedules?schoolId=SCH-IISS&include_inactive=true`, {
      headers: auth,
      cache: "no-store",
    }),
    fetch(`${admission}/admin/tests/schedules/${encodeURIComponent(id)}/sessions`, {
      headers: auth,
      cache: "no-store",
    }),
    fetch(`${admission}/admin/applications`, { headers: auth, cache: "no-store" }),
  ]);

  if (scheduleRes.status === 403 || sessionsRes.status === 403) {
    return <div className="mx-auto max-w-3xl px-6 py-10">Admin access required.</div>;
  }

  // Schedule itself: we list all schedules (both schools) and find ours.
  // Simpler than adding a dedicated GET /admin/tests/schedules/:id endpoint.
  const scheduleBodyIISS = (await scheduleRes.json().catch(() => null)) as Envelope<Schedule[]> | null;
  let schedule = (scheduleBodyIISS?.data ?? []).find((s) => s.testScheduleId === id);
  if (!schedule) {
    // Try IIHS too.
    const alt = await fetch(
      `${admission}/admin/tests/schedules?schoolId=SCH-IIHS&include_inactive=true`,
      { headers: auth, cache: "no-store" },
    );
    const altBody = (await alt.json().catch(() => null)) as Envelope<Schedule[]> | null;
    schedule = (altBody?.data ?? []).find((s) => s.testScheduleId === id);
  }
  if (!schedule) notFound();

  const sessionsBody = (await sessionsRes.json().catch(() => null)) as Envelope<SessionCardSession[]> | null;
  const sessions = sessionsBody?.data ?? [];

  const appsBody = (await appsRes.json().catch(() => null)) as Envelope<ApplicationSummary[]> | null;
  const apps = appsBody?.data ?? [];

  // Build a student_id → {name, parent} lookup + student_id → latest result.
  const studentLookup = new Map<string, { name: string; parent: string }>();
  for (const a of apps) {
    for (const s of a.students) {
      studentLookup.set(s.studentId, { name: s.fullName, parent: a.lead.parentName });
    }
  }

  // Latest results per student for these sessions. We fetch by scanning
  // /me/tests for each student — too expensive. Instead, the sessions
  // themselves carry enough info; the SessionRow will GET the result
  // lazily on expand if needed. For MVP, show whatever the result may
  // already encode on the session side.
  // TODO: add a dedicated GET /admin/tests/sessions/:id/result endpoint
  // to populate existingResult here.
  const resultsByStudent: Map<string, SessionCardResult> = new Map();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <nav>
        <Link href="/admin/tests/schedules" className="text-sm text-[var(--ds-primary)] hover:underline">
          ← Back to schedules
        </Link>
      </nav>

      <header className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          Test schedule
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
          {schedule.scheduledDate} &middot; {schedule.timeslotStart}–{schedule.timeslotEnd}
        </h1>
        <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
          {schedule.testLocation}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
          <KV label="School" value={schedule.schoolId.replace("SCH-", "")} />
          <KV label="Type" value={schedule.scheduleType.replace(/_/g, " ")} />
          <KV label="Capacity" value={`${schedule.bookedCount} / ${schedule.capacity}`} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">Status</p>
            <div className="mt-0.5"><StatusBadge status={schedule.status} size="sm" /></div>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--ds-border)] pt-4">
          <ScheduleActions
            scheduleId={schedule.testScheduleId}
            scheduleStatus={schedule.status}
          />
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--ds-text-primary)]">
          Sessions ({sessions.length})
        </h2>
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-10 text-center text-sm text-[var(--ds-text-secondary)]">
            No one has booked this slot yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((sess) => {
              const s = studentLookup.get(sess.applicantStudentId);
              const displayName = s
                ? `${s.name} (parent: ${s.parent})`
                : undefined;
              return (
                <SessionRow
                  key={sess.testSessionId}
                  session={sess}
                  studentName={displayName}
                  existingResult={resultsByStudent.get(sess.applicantStudentId) ?? null}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[var(--ds-text-primary)]">{value}</p>
    </div>
  );
}
