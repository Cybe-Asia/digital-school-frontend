import { render, screen, waitFor } from "@testing-library/react";
import { QueryProvider } from "@/components/query-provider";
import { SetupAccountForm } from "@/features/admissions-auth/presentation/components/setup-account-form";

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

describe("SetupAccountForm", () => {
  beforeEach(() => {
    routerPush.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
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
    stubFetch(async () =>
      jsonResponse(400, {
        responseCode: 400,
        responseMessage: "invalid token",
        responseError: { formError: "response.verification.invalid_token" },
        data: null,
      }),
    );

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
    stubFetch(async () =>
      jsonResponse(200, {
        responseCode: 200,
        responseMessage: "success",
        data: {
          admissionId: "adm-1",
          email: "parent@example.com",
          parentName: "Siti Rahmawati",
          whatsappNumber: "+62 812 3456 7890",
          schoolSelection: "IIHS",
          location: "South Jakarta",
          occupation: "Engineer",
          hearAboutSchool: "Social Media",
          referralCode: null,
          existingStudents: 0,
          isVerified: true,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      }),
    );

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
