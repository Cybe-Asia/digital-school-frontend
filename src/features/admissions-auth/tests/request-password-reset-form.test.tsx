import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { RequestPasswordResetForm } from "@/features/admissions-auth/presentation/components/request-password-reset-form";

function stubFetch(impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("RequestPasswordResetForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <RequestPasswordResetForm />
      </QueryProvider>,
    );

    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("shows unknown account error from backend", async () => {
    const user = userEvent.setup();
    stubFetch(async () =>
      // Backend request-password-reset returns a non-2xx when the email
      // isn't registered. The repository's toLegacyFailure() reads the
      // top-level fieldErrors / formError bag, which the form then
      // wires into the email input.
      jsonResponse(404, {
        success: false,
        fieldErrors: { email: "response.reset.not_found" },
      }),
    );

    render(
      <QueryProvider>
        <RequestPasswordResetForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/admissions account email/i), "unknown@cybe.school");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText("No admissions account was found for this email.")).toBeInTheDocument();
    });
  });

  it("shows success state when backend accepts", async () => {
    const user = userEvent.setup();
    stubFetch(async () =>
      jsonResponse(200, {
        success: true,
        message: "response.reset.success",
      }),
    );

    render(
      <QueryProvider>
        <RequestPasswordResetForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/admissions account email/i), "parent@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText("Reset link sent.")).toBeInTheDocument();
    });
  });
});
