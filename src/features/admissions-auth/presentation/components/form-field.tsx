"use client";

import { useI18n } from "@/i18n";
import { cn } from "@/shared/lib/cn";
import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  /** Optional interpolation values for the label (e.g. `{number: 2}`
   *  fills `"Age of child {number}"`). */
  labelValues?: Record<string, string | number>;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, labelValues, htmlFor, hint, error, children }: FormFieldProps) {
  const { t } = useI18n();
  const labelId = `${htmlFor}-label`;

  return (
    <div>
      <label id={labelId} htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[var(--ds-text-primary)]">
        {t(label, labelValues)}
      </label>
      {children}
      <div className="mt-2 min-h-5">
        <p className={cn("text-xs", error ? "text-[#b42318]" : "text-[var(--ds-text-secondary)]")}>
          {error ? t(error) : hint ? t(hint) : undefined}
        </p>
      </div>
    </div>
  );
}
