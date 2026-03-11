import { setupOtpSchema } from "@/features/admissions-auth/schemas/setup-otp-schema";

describe("setupOtpSchema", () => {
  it("requires 4-digit otp", () => {
    const result = setupOtpSchema.safeParse({
      token: "valid-token",
      otp: "12",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.otp).toContain("validation.setup.otp_format");
    }
  });

  it("accepts valid payload", () => {
    const result = setupOtpSchema.safeParse({
      token: "valid-token",
      otp: "1234",
    });

    expect(result.success).toBe(true);
  });
});
