import { render, screen } from "@testing-library/react";
import { ThemeLabControls } from "@/features/admissions-auth/presentation/components/theme-lab-controls";

describe("ThemeLabControls", () => {
  it("exposes the preserved palette selector", () => {
    render(<ThemeLabControls />);

    expect(screen.getByRole("combobox", { name: /select branding option/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle theme mode/i })).toBeInTheDocument();
  });
});
