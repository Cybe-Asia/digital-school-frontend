import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { LoginForm } from "@/features/admissions-auth/presentation/components/login-form";

function stubFetch(impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("LoginForm", () => {
  beforeEach(() => {
    // Prevent real navigation when the form succeeds.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { assign: vi.fn(), href: "" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows Google and reset-password options", () => {
    render(
      <QueryProvider>
        <LoginForm />
      </QueryProvider>,
    );

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute("href", "/auth/request-reset");
  });

  it("shows inline validation errors", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <LoginForm />
      </QueryProvider>,
    );

    await user.click(screen.getByRole("button", { name: /sign in to admissions/i }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("surfaces the backend locked-account error", async () => {
    const user = userEvent.setup();
    stubFetch(async () =>
      jsonResponse(403, {
        responseCode: 403,
        responseMessage: "locked",
        responseError: { formError: "response.login.locked" },
        data: null,
      }),
    );

    render(
      <QueryProvider>
        <LoginForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/email address/i), "locked@cybe.school");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in to admissions/i }));

    await waitFor(() => {
      expect(
        screen.getByText("This account needs help from admissions before it can sign in."),
      ).toBeInTheDocument();
    });
  });

  it("shows the success banner when the backend accepts credentials", async () => {
    const user = userEvent.setup();
    stubFetch(async (input) => {
      const url = String(input);
      if (url.endsWith("/login")) {
        return jsonResponse(200, {
          responseCode: 200,
          responseMessage: "success",
          data: {
            jwtAccessToken: "test-access-token",
            refreshToken: "test-refresh-token",
          },
        });
      }
      // session-api POST /api/auth/session — return OK so the form
      // can continue into the redirect branch.
      return jsonResponse(200, { authenticated: true });
    });

    render(
      <QueryProvider>
        <LoginForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/email address/i), "parent@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in to admissions/i }));

    await waitFor(() => {
      expect(screen.getByText("Sign-in simulated successfully.")).toBeInTheDocument();
    });
  });
});
