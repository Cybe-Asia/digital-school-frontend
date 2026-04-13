import { requestPasswordResetSchema } from "@/features/admissions-auth/schemas/request-password-reset-schema";

describe("requestPasswordResetSchema", () => {
  it("requires a valid email", () => {
    const result = requestPasswordResetSchema.safeParse({
      email: "invalid",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid email", () => {
    const result = requestPasswordResetSchema.safeParse({
      email: "parent@example.com",
    });

    expect(result.success).toBe(true);
  });
});
