describe("createAdmissionsAuthRepository", () => {
  const originalMode = process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE;
  const originalBaseUrl = process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE = originalMode;
    process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL = originalBaseUrl;
  });

  it("returns mock repository by default", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE;

    const { createAdmissionsAuthRepository } = await import(
      "@/features/admissions-auth/infrastructure/create-admissions-auth-repository"
    );

    const repository = createAdmissionsAuthRepository();

    expect(repository.constructor.name).toBe("MockAdmissionsAuthRepository");
  });

  it("returns api repository when mode is real", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE = "real";

    const { createAdmissionsAuthRepository } = await import(
      "@/features/admissions-auth/infrastructure/create-admissions-auth-repository"
    );

    const repository = createAdmissionsAuthRepository();

    expect(repository.constructor.name).toBe("ApiAdmissionsAuthRepository");
  });

  it("provides service endpoints for the real repository", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE = "real";
    process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL = "http://localhost:8080";

    const { createAdmissionsAuthRepository } = await import(
      "@/features/admissions-auth/infrastructure/create-admissions-auth-repository"
    );

    const repository = createAdmissionsAuthRepository();

    expect(repository.constructor.name).toBe("ApiAdmissionsAuthRepository");
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
