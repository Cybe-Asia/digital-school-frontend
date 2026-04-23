import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { CreateSectionForm } from "./create-section-form";

export const metadata: Metadata = {
  title: "SIS Sections | Admin",
};

const SESSION_COOKIE_NAME = "ds-session";
type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Section = {
  sectionId: string;
  schoolId: string;
  name: string;
  yearGroup: string;
  academicYear: string;
  status: string;
  enrolledCount: number;
};

type SP = Record<string, string | string[] | undefined>;
function getSP(sp: SP, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export default async function AdminSectionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return <div className="mx-auto max-w-3xl px-6 py-10 text-sm">Please log in first.</div>;

  const sp = await searchParams;
  const school = getSP(sp, "school") ?? "";
  const academicYear = getSP(sp, "academicYear") ?? "";

  const qs = new URLSearchParams();
  if (school) qs.set("school", school);
  if (academicYear) qs.set("academicYear", academicYear);

  const { admission } = getServerServiceEndpoints();
  let payload: ApiEnvelope<Section[]> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/sis/sections${qs.toString() ? `?${qs.toString()}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<Section[]> | null;
  } catch {
    // upstream down
  }
  if (httpStatus === 403) {
    return <div className="mx-auto max-w-3xl px-6 py-10 text-sm"><h1 className="text-xl font-semibold">Admin access required</h1></div>;
  }

  const sections = payload?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="surface-card mb-6 rounded-3xl p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 12 2l9 7" /><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /><path d="M9 21v-6h6v6" /></svg>
            </span>
            <div>
              <span className="eyebrow-chip">School · SIS</span>
              <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">Sections</h1>
              <p className="mt-1.5 max-w-xl text-sm text-[var(--ds-text-secondary)]">
                <span className="font-semibold text-[var(--ds-text-primary)]">{sections.length}</span> active · bridge from admissions into timetable, attendance, and grades.
              </p>
            </div>
          </div>
        </div>
      </header>

      <CreateSectionForm />

      <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-surface)] shadow-[var(--ds-shadow-soft)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ds-soft)]/60 text-[11px] uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Name</th>
                <th className="px-5 py-3.5 font-bold">School</th>
                <th className="px-5 py-3.5 font-bold">Year group</th>
                <th className="px-5 py-3.5 font-bold">AY</th>
                <th className="px-5 py-3.5 font-bold">Enrolled</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-border)]/70">
              {sections.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-14">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ds-soft)] text-[var(--ds-primary)]" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18M3 9h18" /></svg>
                    </span>
                    <p className="text-base font-semibold text-[var(--ds-text-primary)]">No sections yet</p>
                    <p className="max-w-md text-sm text-[var(--ds-text-secondary)]">Create one above — you&apos;ll need at least an active section before you can assign enrolled students to it.</p>
                  </div>
                </td></tr>
              ) : sections.map((s) => (
                <tr key={s.sectionId} className="transition-colors hover:bg-[var(--ds-soft)]/40">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/sis/sections/${encodeURIComponent(s.sectionId)}`}
                      className="font-semibold text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[var(--ds-text-primary)]">{s.schoolId}</td>
                  <td className="px-5 py-4 text-[var(--ds-text-primary)]">{s.yearGroup}</td>
                  <td className="px-5 py-4 text-[var(--ds-text-primary)]">{s.academicYear}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[var(--ds-soft)] px-2 text-xs font-bold text-[var(--ds-text-primary)]">{s.enrolledCount}</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={s.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
