import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { SetupAccountForm } from "@/features/admissions-auth/presentation/components/setup-account-form";

const searchState = {
  value: "token=valid-token",
};
const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(searchState.value),
  useRouter: () => ({
    push: routerPush,
  }),
}));

describe("SetupAccountForm", () => {
  beforeEach(() => {
    routerPush.mockReset();
  });

  it("shows missing token state", () => {
    searchState.value = "";

    render(
      <QueryProvider>
        <SetupAccountForm />
      </QueryProvider>,
    );

    expect(screen.getByText(/setup token is missing/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /send otp to whatsapp/i })).not.toBeInTheDocument();
  });

  it("shows expired token error from setup context", async () => {
    searchState.value = "token=expired-token";

    render(
      <QueryProvider>
        <SetupAccountForm />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/this setup link has expired/i)).toBeInTheDocument();
    });
  });

  it("opens the dedicated otp page", async () => {
    searchState.value = "token=valid-token";
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountForm />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send otp to whatsapp/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /send otp to whatsapp/i }));

    expect(routerPush).toHaveBeenCalledWith("/auth/setup-account/otp?token=valid-token");
  });
});
