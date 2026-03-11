import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { SetupAccountOtpForm } from "@/features/admissions-auth/presentation/components/setup-account-otp-form";
import { getSetupOtpSessionKey } from "@/features/admissions-auth/presentation/lib/setup-otp-session";

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

describe("SetupAccountOtpForm", () => {
  beforeEach(() => {
    routerPush.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows missing token state", () => {
    searchState.value = "";

    render(
      <QueryProvider>
        <SetupAccountOtpForm />
      </QueryProvider>,
    );

    expect(screen.getByText(/setup token is missing/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verify otp/i })).not.toBeInTheDocument();
  });

  it("auto sends otp on page open and re-enables resend after 60 seconds", async () => {
    vi.useFakeTimers();
    searchState.value = "token=valid-token";

    render(
      <QueryProvider>
        <SetupAccountOtpForm />
      </QueryProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });

    expect(screen.getByText(/otp has been sent to your whatsapp number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resend available in 60s/i })).toBeDisabled();

    for (let second = 0; second < 61; second += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }

    expect(screen.getByRole("button", { name: /resend otp/i })).toBeEnabled();
  });

  it("verifies otp and moves to the next page", async () => {
    searchState.value = "token=valid-token";
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountOtpForm />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/otp has been sent to your whatsapp number/i)).toBeInTheDocument();
    });

    await user.type(screen.getByRole("textbox", { name: /otp digit 1/i }), "1234");
    await user.click(screen.getByRole("button", { name: /verify otp/i }));

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/auth/setup-account/method?token=valid-token");
    });

    expect(sessionStorage.getItem(getSetupOtpSessionKey("valid-token"))).toBe("1");
  });

  it("supports pasting the otp into the first slot", async () => {
    searchState.value = "token=valid-token";
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountOtpForm />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/otp has been sent to your whatsapp number/i)).toBeInTheDocument();
    });

    const firstSlot = screen.getByRole("textbox", { name: /otp digit 1/i });
    await user.click(firstSlot);
    await user.paste("1234");

    const otpSlots = screen.getAllByRole("textbox");
    expect(otpSlots[0]).toHaveValue("1");
    expect(otpSlots[1]).toHaveValue("2");
    expect(otpSlots[2]).toHaveValue("3");
    expect(otpSlots[3]).toHaveValue("4");
  });
});
