describe("createAdmissionsAuthRepository", () => {
  const originalMode = process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE = originalMode;
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
});
