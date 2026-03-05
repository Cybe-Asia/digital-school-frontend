"use client";

import { paletteOptions, useTheme, type ThemePalette } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { mode, palette, setPalette, toggleMode } = useTheme();

  return (
    <div className="theme-controls flex flex-wrap items-center justify-end gap-2">
      <label htmlFor="palette-select" className="sr-only">
        Select branding option
      </label>
      <select
        id="palette-select"
        value={palette}
        className="theme-select rounded-full border border-[var(--ds-border)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]"
        onChange={(event) => setPalette(event.target.value as ThemePalette)}
      >
        {paletteOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

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
