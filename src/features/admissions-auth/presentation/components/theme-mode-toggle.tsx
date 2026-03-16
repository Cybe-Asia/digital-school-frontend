"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

type ThemeModeToggleProps = {
  className?: string;
};

export function ThemeModeToggle({ className }: ThemeModeToggleProps) {
  const mode = useTheme((state) => state.mode);
  const toggleMode = useTheme((state) => state.toggleMode);

  return (
    <Button
      variant="secondary"
      className={cn("w-full rounded-full px-4 py-2 sm:w-auto", className)}
      onClick={toggleMode}
      aria-label="Toggle theme mode"
    >
      {mode === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}
