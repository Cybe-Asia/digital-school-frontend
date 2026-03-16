import { cn } from "@/shared/lib/cn";
import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[var(--ds-text-primary)]">
        {label}
      </label>
      {children}
      <div className="mt-2 min-h-5">
        <p className={cn("text-xs", error ? "text-[#b42318]" : "text-[var(--ds-text-secondary)]")}>{error ?? hint}</p>
      </div>
    </div>
  );
}
