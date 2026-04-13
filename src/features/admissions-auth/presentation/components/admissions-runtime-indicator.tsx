import type { AdmissionsApiMode } from "@/features/admissions-auth/infrastructure/admissions-auth-runtime-config";

type AdmissionsRuntimeIndicatorProps = {
  mode: AdmissionsApiMode;
  baseUrl: string;
};

export function AdmissionsRuntimeIndicator({ mode, baseUrl }: AdmissionsRuntimeIndicatorProps) {
  const isReal = mode === "real";

  return (
    <div
      data-testid="admissions-runtime-indicator"
      className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-[var(--ds-border-soft)] bg-[color-mix(in_srgb,var(--ds-surface-elevated)_86%,white)] px-3 py-1.5 text-xs text-[var(--ds-text-secondary)]"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${isReal ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      <span className="font-semibold uppercase tracking-[0.16em]">{isReal ? "API REAL" : "API MOCK"}</span>
      {isReal && baseUrl ? <span className="font-mono text-[var(--ds-text-primary)]">{baseUrl}</span> : null}
    </div>
  );
}
