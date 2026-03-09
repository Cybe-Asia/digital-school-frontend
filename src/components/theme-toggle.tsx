"use client";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const mode = useTheme((state) => state.mode);
  const toggleMode = useTheme((state) => state.toggleMode);

  return (
    <div className="theme-controls flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        className="theme-toggle rounded-full border border-[var(--ds-border)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]"
        onClick={toggleMode}
        aria-label="Toggle theme mode"
      >
        {mode === "dark" ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
}
