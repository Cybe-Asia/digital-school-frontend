import { cn } from "@/shared/lib/cn";
import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return <select className={cn("field-select w-full rounded-2xl px-4 py-3 text-sm", className)} {...props} />;
}
