import { render, screen, waitFor } from "@testing-library/react";
import { QueryProvider } from "@/components/query-provider";
import { SetupAccountForm } from "@/features/admissions-auth/presentation/components/setup-account-form";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

describe("SetupAccountForm", () => {
  beforeEach(() => {
    routerPush.mockReset();
  });

  it("shows missing token state when neither token nor admissionId is provided", () => {
    render(
      <QueryProvider>
        <SetupAccountForm token="" admissionId="" />
      </QueryProvider>,
    );

    expect(screen.getByText(/missing setup link/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /send otp to whatsapp/i })).not.toBeInTheDocument();
  });

  it("shows error state for invalid token", async () => {
    // The mock repository rejects `invalid-token` (and empty token).
    // `expired-token` is not in the rejection list — it returns the
    // happy-path admission payload, which is why the previous test
    // name was misleading and the assertion never matched.
    render(
      <QueryProvider>
        <SetupAccountForm token="invalid-token" admissionId="" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/link expired|failed|error|invalid/i)).toBeInTheDocument();
    });
  });

  it("shows the continue button when verification succeeds", async () => {
    render(
      <QueryProvider>
        <SetupAccountForm token="valid-token" admissionId="" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send otp to whatsapp/i })).toBeInTheDocument();
    });
  });
});
