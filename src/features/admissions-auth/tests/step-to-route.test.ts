import { describe, it, expect } from "vitest";
import { stepToRoute } from "@/features/admissions-auth/presentation/lib/step-to-route";

describe("stepToRoute", () => {
  const ID = "LEAD-abc-123";

  it("routes early steps back to the verify-email entry", () => {
    expect(stepToRoute("eoi_submitted", ID)).toBe(
      `/auth/setup-account?admissionId=${encodeURIComponent(ID)}`,
    );
    expect(stepToRoute("email_verified", ID)).toBe(
      `/auth/setup-account?admissionId=${encodeURIComponent(ID)}`,
    );
  });

  it("routes sign_in_set to the method picker", () => {
    expect(stepToRoute("sign_in_set", ID)).toBe(
      `/auth/setup-account/method?admissionId=${encodeURIComponent(ID)}`,
    );
  });

  it("routes students_added to the payment page", () => {
    expect(stepToRoute("students_added", ID)).toBe(
      `/auth/setup-account/payment?admissionId=${encodeURIComponent(ID)}`,
    );
  });

  it("routes application_fee_paid to test booking", () => {
    expect(stepToRoute("application_fee_paid", ID)).toBe(
      `/auth/setup-account/tests?admissionId=${encodeURIComponent(ID)}`,
    );
  });

  it("routes any post-payment / unknown step to the parent dashboard", () => {
    expect(stepToRoute("test_booked", ID)).toBe("/dashboard/parent");
    expect(stepToRoute("test_completed", ID)).toBe("/dashboard/parent");
    expect(stepToRoute("documents_requested", ID)).toBe("/dashboard/parent");
    expect(stepToRoute("documents_complete", ID)).toBe("/dashboard/parent");
    expect(stepToRoute("offer_pending", ID)).toBe("/dashboard/parent");
    expect(stepToRoute("closed", ID)).toBe("/dashboard/parent");
  });

  it("falls back to the parent dashboard for an unknown step value", () => {
    // Forward-compatibility: a backend bumping the enum without a
    // frontend deploy must not 500 the page — the fallback target
    // keeps the parent in a usable place.
    expect(stepToRoute("future_unknown_step", ID)).toBe("/dashboard/parent");
  });

  it("URL-encodes the admissionId so unsafe characters can't break the URL", () => {
    const messy = "LEAD-with space&extra";
    const out = stepToRoute("students_added", messy);
    expect(out).toBe(
      `/auth/setup-account/payment?admissionId=${encodeURIComponent(messy)}`,
    );
    expect(out).not.toContain(" ");
    expect(out).not.toContain("&extra");
  });
});
