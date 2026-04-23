import type { Step } from "@/components/ui/step-indicator";

/**
 * Canonical ordering of the post-register setup-account flow. The real
 * journey varies by user — parents who chose Google skip "method" and
 * go straight to additional, parents who are paying enrolment fee loop
 * back to payment. What we render here is the *default new-parent*
 * happy path so every page shows an anchored progress strip with the
 * same rhythm ("Step 3 of 6").
 *
 * Design principle #9.
 */
export type SetupStepId =
  | "account"
  | "otp"
  | "method"
  | "additional"
  | "payment"
  | "tests"
  | "documents";

const DEFAULT_STEPS: SetupStepId[] = [
  "account",
  "otp",
  "method",
  "additional",
  "payment",
  "tests",
  "documents",
];

const LABEL_KEY: Record<SetupStepId, string> = {
  account: "ui.setup.step.account",
  otp: "ui.setup.step.otp",
  method: "ui.setup.step.method",
  additional: "ui.setup.step.additional",
  payment: "ui.setup.step.payment",
  tests: "ui.setup.step.tests",
  documents: "ui.setup.step.documents",
};

export type SetupStepIndicator = {
  steps: Step[];
  currentIndex: number;
  summaryLabel: string;
};

/**
 * Build an already-translated step indicator payload for use by
 * `<AuthShell stepIndicator={…} />`. Keeping the translation work here
 * means page components stay declarative.
 */
export function buildSetupStepIndicator(
  t: (key: string, values?: Record<string, string | number>) => string,
  active: SetupStepId,
): SetupStepIndicator {
  const ids = DEFAULT_STEPS;
  const currentIndex = Math.max(
    0,
    ids.findIndex((id) => id === active),
  );
  const steps: Step[] = ids.map((id) => ({ label: t(LABEL_KEY[id]) }));
  const summaryLabel = t("ui.step_indicator.summary", {
    current: currentIndex + 1,
    total: ids.length,
    step: t(LABEL_KEY[active]),
  });

  return { steps, currentIndex, summaryLabel };
}
