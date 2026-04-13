import { render, screen } from "@testing-library/react";
import { EOISuccessView } from "@/features/admissions-auth/presentation/components/eoi-success-view";

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
});
