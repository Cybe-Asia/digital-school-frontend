import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { LoginForm } from "@/features/admissions-auth/presentation/components/login-form";

describe("LoginForm", () => {
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

  it("shows the mocked locked account error", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <LoginForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/email address/i), "locked@cybe.school");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in to admissions/i }));

    await waitFor(() => {
      expect(screen.getByText("This account needs help from admissions before it can sign in.")).toBeInTheDocument();
    });

    expect(screen.queryByText("Sign-in simulated successfully.")).not.toBeInTheDocument();
  });

  it("shows the mocked success state", async () => {
    const user = userEvent.setup();

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
