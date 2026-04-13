import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { SetupAccountOtpForm } from "@/features/admissions-auth/presentation/components/setup-account-otp-form";
import { getSetupOtpSessionKey } from "@/features/admissions-auth/presentation/lib/setup-otp-session";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
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

  it("shows missing token state when no phoneNumber", () => {
    render(
      <QueryProvider>
        <SetupAccountOtpForm admissionId="valid-token" phoneNumber="" />
      </QueryProvider>,
    );

    expect(screen.getByText(/setup token is missing/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verify otp/i })).not.toBeInTheDocument();
  });

  it("auto sends otp on page open and re-enables resend after 60 seconds", async () => {
    vi.useFakeTimers();

    render(
      <QueryProvider>
        <SetupAccountOtpForm admissionId="valid-token" phoneNumber="628123456789" />
      </QueryProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });

    expect(screen.getByRole("button", { name: /resend available in 60s/i })).toBeDisabled();

    for (let second = 0; second < 61; second += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }

    expect(screen.getByRole("button", { name: /resend otp/i })).toBeEnabled();
  });

  it("verifies otp and moves to the next page", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountOtpForm admissionId="valid-token" phoneNumber="628123456789" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /verify otp/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole("textbox", { name: /otp digit 1/i }), "1234");
    await user.click(screen.getByRole("button", { name: /verify otp/i }));

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/auth/setup-account/method?admissionId=valid-token");
    });

    expect(sessionStorage.getItem(getSetupOtpSessionKey("valid-token"))).toBe("1");
  });

  it("supports pasting the otp into the first slot", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountOtpForm admissionId="valid-token" phoneNumber="628123456789" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /verify otp/i })).toBeInTheDocument();
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
