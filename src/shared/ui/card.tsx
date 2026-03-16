import { cn } from "@/shared/lib/cn";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn("surface-card rounded-[28px] p-6 sm:p-8", className)} {...props} />;
}
