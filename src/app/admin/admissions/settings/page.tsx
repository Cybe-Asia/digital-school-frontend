import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { SettingsRowEditor } from "./settings-row-editor";
import { CreateSettingsForm } from "./create-settings-form";

export const metadata: Metadata = {
  title: "Admissions Settings | Admin",
};

const SESSION_COOKIE_NAME = "ds-session";
type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

export type Settings = {
  schoolId: string;
  academicYear: string;
  applicationFeeAmount: number;
  enrolmentFeeAmount: number;
  defaultOfferDays: number;
  requiredDocuments: string;
  termsVersion: string;
  updatedAt: string;
  updatedBy?: string | null;
};

export default async function AdminAdmissionsSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return <div className="mx-auto max-w-3xl px-6 py-10 text-sm">Please log in first.</div>;

  const { admission } = getServerServiceEndpoints();
  let httpStatus = 0;
  let payload: ApiEnvelope<Settings[]> | null = null;
  try {
    const res = await fetch(`${admission}/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<Settings[]> | null;
  } catch {
    // upstream down — payload stays null
  }
  if (httpStatus === 403) {
    return <div className="mx-auto max-w-3xl px-6 py-10 text-sm"><h1 className="text-xl font-semibold">Admin access required</h1></div>;
  }
  const rows = payload?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="surface-card mb-6 rounded-3xl p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </span>
          <div>
            <span className="eyebrow-chip">Admissions configuration</span>
            <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">Settings</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-[var(--ds-text-secondary)]">
              Per school × academic year. Changes take effect on the next request that reads settings — no redeploy needed.
            </p>
          </div>
        </div>
      </header>

      <CreateSettingsForm />

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-soft)]/35 px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ds-surface)] text-[var(--ds-primary)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
            </div>
            <p className="text-base font-semibold text-[var(--ds-text-primary)]">No settings rows yet</p>
            <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">Create one above to start overriding the hardcoded defaults.</p>
          </div>
        ) : rows.map((r) => (
          <SettingsRowEditor key={`${r.schoolId}-${r.academicYear}`} initial={r} />
        ))}
      </div>
    </div>
  );
}
