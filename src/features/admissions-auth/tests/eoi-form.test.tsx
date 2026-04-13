import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { EOIForm } from "@/features/admissions-auth/presentation/components/eoi-form";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

describe("EOIForm", () => {
  beforeEach(() => {
    routerPush.mockReset();
  });

  it("shows validation errors for invalid submission", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <EOIForm />
      </QueryProvider>,
    );

    await user.click(screen.getByRole("button", { name: /register your child's interest/i }));

    expect(await screen.findByText("Parent name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid WhatsApp number.")).toBeInTheDocument();
    expect(screen.getByText("Location or suburb is required.")).toBeInTheDocument();
    expect(screen.getByText("Occupation is required.")).toBeInTheDocument();
  });

  it("requires children count when existing students is yes", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <EOIForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/parent name/i), "Siti Rahmawati");
    await user.type(screen.getByLabelText(/email address/i), "parent@example.com");
    await user.type(screen.getByLabelText(/whatsapp number/i), "+62 812 3456 7890");
    await user.type(screen.getByLabelText(/location \/ suburb/i), "South Jakarta");
    await user.type(screen.getByLabelText(/occupation/i), "Entrepreneur");
    await user.selectOptions(screen.getByLabelText(/existing students enrolled/i), "yes");
    await user.click(screen.getByRole("button", { name: /register your child's interest/i }));

    expect(await screen.findByText("Enter the number of children currently enrolled.")).toBeInTheDocument();
  });

  it("shows the mocked duplicate email error", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <EOIForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/parent name/i), "Siti Rahmawati");
    await user.type(screen.getByLabelText(/email address/i), "existing@cybe.school");
    await user.type(screen.getByLabelText(/whatsapp number/i), "+62 812 3456 7890");
    await user.type(screen.getByLabelText(/location \/ suburb/i), "South Jakarta");
    await user.type(screen.getByLabelText(/occupation/i), "Entrepreneur");
    await user.type(screen.getByLabelText(/referral code/i), "REF-2026");
    await user.click(screen.getByRole("button", { name: /register your child's interest/i }));

    await waitFor(() => {
      expect(screen.getByText("This email already has an admissions account.")).toBeInTheDocument();
    });

    expect(routerPush).not.toHaveBeenCalled();
  });

  it("routes to the dedicated success page after submit", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <EOIForm />
      </QueryProvider>,
    );

    await user.type(screen.getByLabelText(/parent name/i), "Siti Rahmawati");
    await user.type(screen.getByLabelText(/email address/i), "parent@example.com");
    await user.type(screen.getByLabelText(/whatsapp number/i), "+62 812 3456 7890");
    await user.type(screen.getByLabelText(/location \/ suburb/i), "South Jakarta");
    await user.type(screen.getByLabelText(/occupation/i), "Entrepreneur");
    await user.click(screen.getByRole("button", { name: /register your child's interest/i }));

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/admissions/register/success?email=parent%40example.com");
    });
  });
});
