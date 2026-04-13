import { render, screen } from "@testing-library/react";
import { AdmissionsRuntimeIndicator } from "@/features/admissions-auth/presentation/components/admissions-runtime-indicator";

describe("AdmissionsRuntimeIndicator", () => {
  it("shows mock mode without a base url", () => {
    render(<AdmissionsRuntimeIndicator mode="mock" baseUrl="" />);

    expect(screen.getByTestId("admissions-runtime-indicator")).toBeInTheDocument();
    expect(screen.getByText("API MOCK")).toBeInTheDocument();
    expect(screen.queryByText("http://localhost:8080")).not.toBeInTheDocument();
  });

  it("shows real mode with the configured base url", () => {
    render(<AdmissionsRuntimeIndicator mode="real" baseUrl="http://localhost:8080" />);

    expect(screen.getByText("API REAL")).toBeInTheDocument();
    expect(screen.getByText("http://localhost:8080")).toBeInTheDocument();
  });
});
