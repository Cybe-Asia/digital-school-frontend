import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationDetailsDialog } from "@/features/admissions-portal/presentation/components/application-details-dialog";

describe("ApplicationDetailsDialog", () => {
  it("opens the details dialog on demand and closes it again", async () => {
    const user = userEvent.setup();

    render(
      <ApplicationDetailsDialog
        openLabel="View student details"
        closeLabel="Close details"
        title="Student application details"
        description="Extra profile information is available here."
        items={[
          { label: "Submitted", value: "18 Mar 2026" },
          { label: "Admissions owner", value: "Farah Putri" },
        ]}
        notesTitle="Family notes"
        notesValue="Needs transport information."
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View student details" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Student application details")).toBeInTheDocument();
    expect(screen.getByText("Needs transport information.")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Close details" })[1]!);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
