import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryProvider } from "@/components/query-provider";
import { SetupAccountAdditionalForm } from "@/features/admissions-auth/presentation/components/setup-account-additional-form";
import { getParentDashboardHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

describe("SetupAccountAdditionalForm", () => {
  beforeEach(() => {
    routerPush.mockReset();
    sessionStorage.clear();
    sessionStorage.setItem("setup-access-token:admission:valid-token", "mock-jwt-token");
  });

  it("shows missing token state", () => {
    render(
      <QueryProvider>
        <SetupAccountAdditionalForm admissionId="" />
      </QueryProvider>,
    );

    expect(screen.getByText(/setup token is missing/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountAdditionalForm admissionId="valid-token" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/eoi details received/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /save and continue/i }));

    expect(await screen.findByText("Student full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Student date of birth is required.")).toBeInTheDocument();
    expect(screen.getByText("Current school is required.")).toBeInTheDocument();
    expect(screen.getByText("Select the intended grade.")).toBeInTheDocument();
  });

  it("supports adding multiple students before redirecting to the parent dashboard", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountAdditionalForm admissionId="valid-token" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/student full name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/student full name/i), "Aisha Rahma");
    await user.type(screen.getByLabelText(/student date of birth/i), "2014-08-17");
    await user.type(screen.getByLabelText(/current school/i), "Little Caliphs School");
    await user.selectOptions(screen.getByLabelText(/target grade level/i), "year7");
    await user.click(screen.getByRole("button", { name: /add another student/i }));
    await user.type(screen.getByLabelText(/student full name/i, { selector: "input#students\\.1\\.studentName" }), "Rayyan Rahma");
    await user.type(screen.getByLabelText(/student date of birth/i, { selector: "input#students\\.1\\.studentBirthDate" }), "2016-01-08");
    await user.type(screen.getByLabelText(/current school/i, { selector: "input#students\\.1\\.currentSchool" }), "Little Caliphs School");
    await user.selectOptions(screen.getByLabelText(/target grade level/i, { selector: "select#students\\.1\\.targetGrade" }), "year8");
    await user.click(screen.getByRole("button", { name: /save and continue/i }));

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith(
        getParentDashboardHref({
          parentName: "Siti Rahmawati",
          email: "parent@example.com",
          school: "iihs",
          students: [
            {
              studentName: "Aisha Rahma",
              studentBirthDate: "2014-08-17",
              currentSchool: "Little Caliphs School",
              targetGrade: "year7",
              notes: "",
            },
            {
              studentName: "Rayyan Rahma",
              studentBirthDate: "2016-01-08",
              currentSchool: "Little Caliphs School",
              targetGrade: "year8",
              notes: "",
            },
          ],
          hasExistingStudents: "no",
          locationSuburb: "South Jakarta",
        }),
      );
    });
  });

  it("lets student cards collapse and expand with clear active state", async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <SetupAccountAdditionalForm admissionId="valid-token" />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /collapse student details student 1/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /collapse student details student 1/i })).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: /add another student/i }));

    expect(screen.getByRole("button", { name: /expand student details student 1/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /collapse student details student 2/i })).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: /expand student details student 1/i }));

    expect(screen.getByRole("button", { name: /collapse student details student 1/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /expand student details student 2/i })).toHaveAttribute("aria-expanded", "false");
  });
});
