import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { RequestPasswordResetForm } from "@/features/admissions-auth/presentation/components/request-password-reset-form";

describe("RequestPasswordResetForm", () => {
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

  it("shows unknown account error", async () => {
    const user = userEvent.setup();

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

  it("shows success state", async () => {
    const user = userEvent.setup();

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
