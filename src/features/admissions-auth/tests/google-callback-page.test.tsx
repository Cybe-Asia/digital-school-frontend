import { render, screen } from "@testing-library/react";
import GoogleCallbackPage from "@/app/(public)/auth/google/callback/page";

describe("GoogleCallbackPage", () => {
  it("renders failure state when error is present", async () => {
    const page = await GoogleCallbackPage({
      searchParams: Promise.resolve({ error: "access_denied" }),
    });

    render(page);

    expect(screen.getByText("Sign-in failed")).toBeInTheDocument();
  });

  it("renders success state when no error", async () => {
    const page = await GoogleCallbackPage({
      searchParams: Promise.resolve({ returnTo: "/dashboard/parent" }),
    });

    render(page);

    expect(screen.getByText("Sign-in completed")).toBeInTheDocument();
  });
});
