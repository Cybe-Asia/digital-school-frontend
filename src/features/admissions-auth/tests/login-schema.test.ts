import { describe, expect, it } from "vitest";
import { loginSchema } from "@/features/admissions-auth/schemas/login-schema";

describe("loginSchema", () => {
  it("rejects invalid email and empty password", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain("validation.email.invalid");
      expect(result.error.flatten().fieldErrors.password).toContain("validation.login.password_required");
    }
  });
});
