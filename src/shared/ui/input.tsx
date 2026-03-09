import { cn } from "@/shared/lib/cn";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn("field-input w-full rounded-2xl px-4 py-3 text-sm", className)} {...props} />;
}
