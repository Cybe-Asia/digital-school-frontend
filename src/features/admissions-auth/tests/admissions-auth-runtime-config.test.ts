import { readAdmissionsAuthRuntimeConfig } from "@/features/admissions-auth/infrastructure/admissions-auth-runtime-config";

describe("readAdmissionsAuthRuntimeConfig", () => {
  it("defaults to mock mode", () => {
    const config = readAdmissionsAuthRuntimeConfig({
      NEXT_PUBLIC_ADMISSIONS_API_MODE: undefined,
      NEXT_PUBLIC_ADMISSIONS_API_BASE_URL: undefined,
    });

    expect(config.mode).toBe("mock");
    expect(config.endpoints).toBeDefined();
  });

  it("keeps real mode", () => {
    const config = readAdmissionsAuthRuntimeConfig({
      NEXT_PUBLIC_ADMISSIONS_API_MODE: "real",
      NEXT_PUBLIC_ADMISSIONS_API_BASE_URL: "http://localhost:8080/",
    });

    expect(config.mode).toBe("real");
    expect(config.endpoints).toBeDefined();
  });
});
