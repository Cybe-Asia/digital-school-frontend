import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

describe("createAdmissionsAuthRepository", () => {
  it("always returns the real API repository", () => {
    const repository = createAdmissionsAuthRepository();
    expect(repository.constructor.name).toBe("ApiAdmissionsAuthRepository");
  });

  it("wires the repository to the shared service endpoints", () => {
    const repository = createAdmissionsAuthRepository();
    expect(repository).toMatchObject({
      endpoints: expect.objectContaining({
        admission: expect.stringContaining("/api/leads/v1"),
        otp: expect.stringContaining("/api/v1/otp-service"),
        auth: expect.stringContaining("/api/v1/auth-service"),
        notification: expect.stringContaining("/api/email/v1"),
      }),
    });
  });
});
