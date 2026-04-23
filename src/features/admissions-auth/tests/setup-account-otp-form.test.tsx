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

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Stubs fetch to return successful envelopes for the OTP endpoints. The
 * exact URL shape depends on which OTP endpoint is being hit — sendOTP
 * returns `{ otp, phoneNumber, expiredIn }`, verifyOTP returns
 * `{ accessToken, admissionId, phoneNumber }`. Any other call (e.g. the
 * session cookie POST) falls through to a plain 200.
 */
function stubHappyPathOtp() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/sendOTP")) {
        return jsonResponse(200, {
          responseCode: 200,
          responseMessage: "success",
          data: {
            phoneNumber: "628123456789",
            otp: "1234",
            expiredIn: 300,
          },
        });
      }
      if (url.endsWith("/verifyOTP")) {
        return jsonResponse(200, {
          responseCode: 200,
          responseMessage: "success",
          data: {
            status: "verified",
            accessToken: "mock-access",
            admissionId: "valid-token",
            phoneNumber: "628123456789",
            jwtSessionToken: null,
          },
        });
      }
      return jsonResponse(200, { authenticated: true });
    }),
  );
}

describe("SetupAccountOtpForm", () => {
  beforeEach(() => {
    routerPush.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
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
    stubHappyPathOtp();
    vi.useFakeTimers();

    render(
      <QueryProvider>
        <SetupAccountOtpForm admissionId="valid-token" phoneNumber="628123456789" />
      </QueryProvider>,
    );

    // Let the auto-send OTP promise resolve so the component flips into
    // the cooldown state before we start counting down.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
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
    stubHappyPathOtp();
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
    stubHappyPathOtp();
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
