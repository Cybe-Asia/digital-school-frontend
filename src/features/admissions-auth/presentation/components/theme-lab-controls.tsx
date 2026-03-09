"use client";

import { paletteOptions, useTheme, type ThemePalette } from "@/components/theme-provider";
import { ThemeModeToggle } from "@/features/admissions-auth/presentation/components/theme-mode-toggle";
import { Select } from "@/shared/ui/select";

export function ThemeLabControls() {
  const palette = useTheme((state) => state.palette);
  const setPalette = useTheme((state) => state.setPalette);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="palette-select" className="sr-only">
        Select branding option
      </label>
      <Select
        id="palette-select"
        value={palette}
        className="min-w-64 rounded-full py-2"
        onChange={(event) => setPalette(event.target.value as ThemePalette)}
      >
        {paletteOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </Select>
      <ThemeModeToggle />
    </div>
  );
}
