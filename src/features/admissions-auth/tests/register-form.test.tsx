import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { RegisterForm } from "@/features/admissions-auth/presentation/components/register-form";

describe("RegisterForm", () => {
  it("shows validation errors for invalid submission", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <RegisterForm />
      </QueryProvider>,
    );

    await user.click(screen.getByRole("button", { name: /create admissions account/i }));

    expect(await screen.findByText("Parent or guardian name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid WhatsApp number.")).toBeInTheDocument();
    expect(screen.getByText("Password must contain at least 8 characters.")).toBeInTheDocument();
  });

  it("shows the mocked duplicate email error", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <RegisterForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/parent or guardian name/i), "Siti Rahmawati");
    await user.type(screen.getByLabelText(/email address/i), "existing@cybe.school");
    await user.type(screen.getByLabelText(/whatsapp number/i), "+62 812 3456 7890");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create admissions account/i }));

    await waitFor(() => {
      expect(screen.getByText("This email already has an admissions account.")).toBeInTheDocument();
    });

    expect(screen.queryByText("Admissions account created.")).not.toBeInTheDocument();
  });

  it("shows the mocked success state", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <RegisterForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/parent or guardian name/i), "Siti Rahmawati");
    await user.type(screen.getByLabelText(/email address/i), "parent@example.com");
    await user.type(screen.getByLabelText(/whatsapp number/i), "+62 812 3456 7890");
    await user.selectOptions(screen.getByLabelText(/school selection/i), "iiss");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create admissions account/i }));

    await waitFor(() => {
      expect(screen.getByText("Admissions account created.")).toBeInTheDocument();
    });
  });
});
