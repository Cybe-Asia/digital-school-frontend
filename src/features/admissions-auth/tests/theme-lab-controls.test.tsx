import { render, screen } from "@testing-library/react";
import { ThemeLabControls } from "@/features/admissions-auth/presentation/components/theme-lab-controls";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("ThemeLabControls", () => {
  it("exposes the preserved palette selector", () => {
    render(<ThemeLabControls />);

    expect(screen.getByRole("combobox", { name: /theme palette/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /appearance mode/i })).toBeInTheDocument();
  });
});
