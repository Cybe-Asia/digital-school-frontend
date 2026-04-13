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

  it("shows error state for expired token", async () => {
    render(
      <QueryProvider>
        <SetupAccountForm token="expired-token" admissionId="" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/link expired|failed|error/i)).toBeInTheDocument();
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
