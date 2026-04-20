import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { EOISuccessView } from "@/features/admissions-auth/presentation/components/eoi-success-view";

// Default mock: flag OFF (current behavior, buttons visible). Individual
// tests can override with `mockUseFlag.mockReturnValueOnce(true)`.
const mockUseFlag = vi.fn((_flag: string, defaultValue: boolean) => defaultValue);

vi.mock("@/components/feature-flags-provider", () => ({
  useFlag: (flag: string, defaultValue: boolean) => mockUseFlag(flag, defaultValue),
}));

beforeEach(() => {
  mockUseFlag.mockClear();
  mockUseFlag.mockImplementation((_flag, defaultValue) => defaultValue);
});

describe("EOISuccessView", () => {
  it("shows the submitted email and both navigation actions", () => {
    render(<EOISuccessView submittedEmail="parent@example.com" />);

    expect(screen.getByText("Check your email for the next step.")).toBeInTheDocument();
    expect(
      screen.getByText("We sent the message to parent@example.com. If it is not in your inbox, check spam or promotions."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to form/i })).toHaveAttribute("href", "/admissions/register");
    expect(screen.getByRole("link", { name: /go to login/i })).toHaveAttribute("href", "/admissions/login");
  });

  it("falls back to the generic hint when the email is missing", () => {
    render(<EOISuccessView />);

    expect(screen.getByText("If the message is not in your inbox, check spam or promotions.")).toBeInTheDocument();
  });

  it("hides both action buttons when eoi-success-hide-actions flag is ON", () => {
    // Flip the flag ON. Both CTAs should disappear from the DOM.
    mockUseFlag.mockImplementation((flag) => {
      if (flag === "eoi-success-hide-actions") {
        return true;
      }
      return false;
    });

    render(<EOISuccessView submittedEmail="parent@example.com" />);

    expect(screen.queryByRole("link", { name: /back to form/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /go to login/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("eoi-success-actions")).not.toBeInTheDocument();

    // Sanity: the rest of the page is still rendered (email hint etc.)
    expect(screen.getByText("Check your email for the next step.")).toBeInTheDocument();
  });

  it("passes the correct default when Unleash is unavailable", () => {
    render(<EOISuccessView submittedEmail="parent@example.com" />);

    // The view asks for the flag with its registered default. If we ever
    // accidentally flip the registered default to `true`, this test
    // catches it — users would suddenly see the buttons hidden by default.
    expect(mockUseFlag).toHaveBeenCalledWith("eoi-success-hide-actions", false);
  });
});
