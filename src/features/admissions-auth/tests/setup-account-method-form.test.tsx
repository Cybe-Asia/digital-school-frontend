import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { SetupAccountMethodForm } from "@/features/admissions-auth/presentation/components/setup-account-method-form";
import { getSetupOtpSessionKey } from "@/features/admissions-auth/presentation/lib/setup-otp-session";

const searchState = {
  value: "token=valid-token",
};

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(searchState.value),
}));

describe("SetupAccountMethodForm", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("shows missing token state", () => {
    searchState.value = "";

    render(
      <QueryProvider>
        <SetupAccountMethodForm />
      </QueryProvider>,
    );

    expect(screen.getByText(/setup token is missing/i)).toBeInTheDocument();
  });

  it("blocks access when OTP is not verified", () => {
    searchState.value = "token=valid-token";

    render(
      <QueryProvider>
        <SetupAccountMethodForm />
      </QueryProvider>,
    );

    expect(screen.getByText(/please complete otp verification first/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to otp verification/i })).toBeInTheDocument();
  });

  it("shows Google and password options after OTP verification", async () => {
    searchState.value = "token=valid-token";
    sessionStorage.setItem(getSetupOtpSessionKey("valid-token"), "1");
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountMethodForm />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /login with google/i })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/create password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /set password and continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/account setup completed/i)).toBeInTheDocument();
    });
  });
});
