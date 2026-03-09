import { describe, expect, it } from "vitest";
import { registerSchema } from "@/features/admissions-auth/schemas/register-schema";

describe("registerSchema", () => {
  it("rejects empty required fields, invalid WhatsApp, and mismatched passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "",
      email: "invalid",
      whatsapp: "abc",
      school: "iihs",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      expect(errors.fullName).toContain("Parent or guardian name is required.");
      expect(errors.email).toContain("Enter a valid email address.");
      expect(errors.whatsapp).toBeTruthy();
      expect(errors.password).toContain("Password must contain at least 8 characters.");
      expect(errors.confirmPassword).toContain("Passwords do not match.");
    }
  });
});
