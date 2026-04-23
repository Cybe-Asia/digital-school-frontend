import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { CreateScheduleForm } from "./create-schedule-form";

export const metadata: Metadata = {
  title: "Test schedules | Admin",
};

const SESSION_COOKIE_NAME = "ds-session";

type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

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

type PageProps = {
  searchParams: Promise<{ schoolId?: string }>;
};

/**
 * Admin landing page for TestSchedules. Shows the list for the selected
 * school side-by-side with an inline create form. Parent testing UI hits
 * the same data via /tests/schedules?schoolId=X.
 */
export default async function AdminTestSchedulesPage({ searchParams }: PageProps) {
  const { schoolId = "SCH-IISS" } = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--ds-text-primary)]">
        Please log in first.
      </div>
    );
  }

  const { admission } = getServerServiceEndpoints();
  // Fetch both schools in parallel so the header tabs can show
  // a schedule-count chip per school ('IIHS · 3' / 'IISS · 1'),
  // not just the active one. Makes it obvious where the newly
  // created row went without having to click through.
  const fetchSchool = (id: string) =>
    fetch(
      `${admission}/admin/tests/schedules?schoolId=${encodeURIComponent(id)}&include_inactive=true`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
  const [res, otherRes] = await Promise.all([
    fetchSchool(schoolId),
    fetchSchool(schoolId === "SCH-IIHS" ? "SCH-IISS" : "SCH-IIHS"),
  ]);
  if (res.status === 403) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold text-[var(--ds-text-primary)]">Admin access required</h1>
      </div>
    );
  }
  const body = (await res.json().catch(() => null)) as ApiEnvelope<Schedule[]> | null;
  const otherBody = (await otherRes.json().catch(() => null)) as ApiEnvelope<Schedule[]> | null;
  const schedules = body?.data ?? [];
  const otherSchedules = otherBody?.data ?? [];
  const iihsCount = schoolId === "SCH-IIHS" ? schedules.length : otherSchedules.length;
  const iissCount = schoolId === "SCH-IISS" ? schedules.length : otherSchedules.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="surface-card mb-6 rounded-3xl p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            </span>
            <div>
              <span className="eyebrow-chip">Assessment scheduling</span>
              <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">Test schedules</h1>
              <p className="mt-1.5 text-sm text-[var(--ds-text-secondary)]">
                Publish slots that parents can book via the test-booking flow.
              </p>
            </div>
          </div>
          <div className="inline-flex rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)] p-1 text-sm">
            <Link
              href="/admin/tests/schedules?schoolId=SCH-IIHS"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition ${
                schoolId === "SCH-IIHS"
                  ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)] shadow-sm"
                  : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-surface)]"
              }`}
            >
              IIHS
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                  schoolId === "SCH-IIHS"
                    ? "bg-[var(--ds-on-primary)]/20"
                    : "bg-[var(--ds-surface)] text-[var(--ds-text-secondary)]"
                }`}
              >
                {iihsCount}
              </span>
            </Link>
            <Link
              href="/admin/tests/schedules?schoolId=SCH-IISS"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition ${
                schoolId === "SCH-IISS"
                  ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)] shadow-sm"
                  : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-surface)]"
              }`}
            >
              IISS
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                  schoolId === "SCH-IISS"
                    ? "bg-[var(--ds-on-primary)]/20"
                    : "bg-[var(--ds-surface)] text-[var(--ds-text-secondary)]"
                }`}
              >
                {iissCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="section-title">All schedules</h2>
            <span className="rounded-full bg-[var(--ds-soft)] px-2.5 py-1 text-xs font-bold text-[var(--ds-text-primary)]">{schedules.length}</span>
          </div>
          {schedules.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-soft)]/35 px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ds-surface)] text-[var(--ds-primary)]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <p className="text-base font-semibold text-[var(--ds-text-primary)]">No schedules yet</p>
              <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">Create one on the right to publish a test slot.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => {
                const full = s.bookedCount >= s.capacity;
                const utilisation = s.capacity > 0 ? Math.round((s.bookedCount / s.capacity) * 100) : 0;
                return (
                  <Link
                    key={s.testScheduleId}
                    href={`/admin/tests/schedules/${encodeURIComponent(s.testScheduleId)}`}
                    className="block rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 sm:p-6 transition card-interactive"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        </span>
                        <div>
                          <p className="text-base font-semibold text-[var(--ds-text-primary)]">
                            {s.scheduledDate} &middot; {s.timeslotStart}–{s.timeslotEnd}
                          </p>
                          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                            {s.testLocation}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={s.status} size="sm" />
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          full ? "bg-[#fee9e9] text-[#8b1f1f]" : "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]"
                        }`}>
                          {s.bookedCount} / {s.capacity}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ds-border)]/50">
                        <div
                          className={`h-full rounded-full transition-all ${full ? "bg-[#ef4444]" : "bg-[var(--ds-primary)]"}`}
                          style={{ width: `${utilisation}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--ds-text-secondary)]">
                      <span>Type: <span className="font-semibold text-[var(--ds-text-primary)]">{s.scheduleType.replace(/_/g, " ")}</span></span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{s.testScheduleId}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside>
          <CreateScheduleForm defaultSchoolId={schoolId} />
        </aside>
      </div>
    </div>
  );
}
