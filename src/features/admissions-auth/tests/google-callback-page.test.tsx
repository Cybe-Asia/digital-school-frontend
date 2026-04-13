import { isRedirectError } from "next/dist/client/components/redirect-error";
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

  it("redirects on the server when returnTo is present", async () => {
    await expect(
      GoogleCallbackPage({
        searchParams: Promise.resolve({ returnTo: "/auth/setup-account/additional?token=valid-token" }),
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return isRedirectError(error);
    });
  });
});
