import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "cta-primary",
  secondary:
    "border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text-primary)] hover:border-[var(--ds-primary)] hover:bg-[var(--ds-soft)]",
  ghost: "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]",
};

export function Button({ className, type = "button", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClassName[variant],
        className,
      )}
      {...props}
    />
  );
}
