export type ThemeMode = "light" | "dark";
export type ThemePalette = "option1" | "option2" | "option3" | "option4" | "option5";
export type ThemeId = `${ThemePalette}-${ThemeMode}`;

export const paletteOptions: Array<{ id: ThemePalette; label: string }> = [
  { id: "option1", label: "Option 1 · Modern Islamic Minimal" },
  { id: "option2", label: "Option 2 · Contemporary Education Tech" },
  { id: "option3", label: "Option 3 · Heritage Meets Future" },
  { id: "option4", label: "Option 4 · Clean Academic White" },
  { id: "option5", label: "Option 5 · Youth Islamic Contemporary" },
];
