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
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
            School (SIS)
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">Sections</h1>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
            {sections.length} section(s) · bridge from admissions into timetable/attendance/grades.
          </p>
        </div>
      </header>

      <CreateSectionForm />

      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--ds-soft)] text-xs uppercase tracking-wider text-[var(--ds-text-secondary)]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Year group</th>
              <th className="px-4 py-3">AY</th>
              <th className="px-4 py-3">Enrolled</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--ds-text-secondary)]">
                No sections yet. Create one above — you&apos;ll need at least an active section before you can assign enrolled students to it.
              </td></tr>
            ) : sections.map((s) => (
              <tr key={s.sectionId} className="border-t border-[var(--ds-border)] hover:bg-[var(--ds-soft)]/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/sis/sections/${encodeURIComponent(s.sectionId)}`}
                    className="font-semibold text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--ds-text-primary)]">{s.schoolId}</td>
                <td className="px-4 py-3 text-[var(--ds-text-primary)]">{s.yearGroup}</td>
                <td className="px-4 py-3 text-[var(--ds-text-primary)]">{s.academicYear}</td>
                <td className="px-4 py-3 text-[var(--ds-text-primary)]">{s.enrolledCount}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
