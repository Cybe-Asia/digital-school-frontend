import { setupAccountSchema } from "@/features/admissions-auth/schemas/setup-account-schema";

describe("setupAccountSchema", () => {
  it("requires token and matching passwords", () => {
    const result = setupAccountSchema.safeParse({
      token: "",
      password: "short",
      confirmPassword: "mismatch",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.token).toContain("validation.setup.token_required");
      expect(errors.password).toContain("validation.setup.password_min");
      expect(errors.confirmPassword).toContain("validation.setup.password_mismatch");
    }
  });

  it("accepts valid payload", () => {
    const result = setupAccountSchema.safeParse({
      token: "valid-token",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
  });
});
