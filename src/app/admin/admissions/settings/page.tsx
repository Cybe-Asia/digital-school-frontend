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
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          Admissions
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
          Per school × academic year. Changes take effect on the next request
          that reads settings — no redeploy needed.
        </p>
      </header>

      <CreateSettingsForm />

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-10 text-center text-sm text-[var(--ds-text-secondary)]">
            No settings rows yet. Create one above to start overriding the hardcoded defaults.
          </div>
        ) : rows.map((r) => (
          <SettingsRowEditor key={`${r.schoolId}-${r.academicYear}`} initial={r} />
        ))}
      </div>
    </div>
  );
}
