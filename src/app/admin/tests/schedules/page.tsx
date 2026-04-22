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
  const res = await fetch(
    `${admission}/admin/tests/schedules?schoolId=${encodeURIComponent(schoolId)}&include_inactive=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  if (res.status === 403) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold text-[var(--ds-text-primary)]">Admin access required</h1>
      </div>
    );
  }
  const body = (await res.json().catch(() => null)) as ApiEnvelope<Schedule[]> | null;
  const schedules = body?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          Admissions
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">
          Test schedules
        </h1>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-[var(--ds-text-secondary)]">School:</span>
          <Link
            href="/admin/tests/schedules?schoolId=SCH-IIHS"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              schoolId === "SCH-IIHS"
                ? "bg-[var(--ds-primary)] text-white"
                : "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]"
            }`}
          >
            IIHS
          </Link>
          <Link
            href="/admin/tests/schedules?schoolId=SCH-IISS"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              schoolId === "SCH-IISS"
                ? "bg-[var(--ds-primary)] text-white"
                : "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]"
            }`}
          >
            IISS
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--ds-text-primary)]">
            All schedules ({schedules.length})
          </h2>
          {schedules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-10 text-center text-sm text-[var(--ds-text-secondary)]">
              No schedules yet. Create one on the right →
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => {
                const full = s.bookedCount >= s.capacity;
                return (
                  <Link
                    key={s.testScheduleId}
                    href={`/admin/tests/schedules/${encodeURIComponent(s.testScheduleId)}`}
                    className="block rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 hover:border-[var(--ds-primary)]/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
                          {s.scheduledDate} &middot; {s.timeslotStart}–{s.timeslotEnd}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                          {s.testLocation}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={s.status} size="sm" />
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          full ? "bg-[#fee9e9] text-[#8b1f1f]" : "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]"
                        }`}>
                          {s.bookedCount} / {s.capacity}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-[var(--ds-text-secondary)]">
                      Type: {s.scheduleType.replace(/_/g, " ")} &middot; ID: {s.testScheduleId}
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
