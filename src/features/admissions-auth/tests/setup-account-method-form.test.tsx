import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { SetupAccountMethodForm } from "@/features/admissions-auth/presentation/components/setup-account-method-form";
import { getSetupAdditionalFormHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { getSetupOtpSessionKey } from "@/features/admissions-auth/presentation/lib/setup-otp-session";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

function stubFetch(impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("SetupAccountMethodForm", () => {
  beforeEach(() => {
    sessionStorage.clear();
    routerPush.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows missing token state", () => {
    render(
      <QueryProvider>
        <SetupAccountMethodForm admissionId="" />
      </QueryProvider>,
    );

    expect(screen.getByText(/setup token is missing/i)).toBeInTheDocument();
  });

  it("blocks access when OTP is not verified", () => {
    render(
      <QueryProvider>
        <SetupAccountMethodForm admissionId="valid-token" />
      </QueryProvider>,
    );

    expect(screen.getByText(/please complete otp verification first/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to otp verification/i })).toBeInTheDocument();
  });

  it("shows Google and password options after OTP verification", async () => {
    // Seed sessionStorage: OTP verified marker, the persisted access
    // token from verifyOTP, and the cached setup context we got from
    // verifyEmail on the previous page.
    sessionStorage.setItem(getSetupOtpSessionKey("valid-token"), "1");
    sessionStorage.setItem("setup-access-token:admission:valid-token", "mock-jwt-token");
    sessionStorage.setItem(
      "admissions-setup-context-cache",
      JSON.stringify({
        "valid-token": {
          parentName: "Siti Rahmawati",
          email: "parent@example.com",
          whatsapp: "+62 812 3456 7890",
          locationSuburb: "South Jakarta",
          occupation: "Entrepreneur",
          hasExistingStudents: "no",
          heardFrom: "social-media",
          school: "iihs",
        },
      }),
    );
    // auth-service /createPassword — returns success envelope.
    stubFetch(async () =>
      jsonResponse(200, {
        responseCode: 200,
        responseMessage: "success",
        data: { passwordCreated: true },
      }),
    );

    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountMethodForm admissionId="valid-token" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /login with google/i })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/create password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /set password and continue/i }));

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith(getSetupAdditionalFormHref("valid-token"));
    });
  });
});
