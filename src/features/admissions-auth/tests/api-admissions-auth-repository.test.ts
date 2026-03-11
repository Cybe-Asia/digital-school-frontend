import { ApiAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/api-admissions-auth-repository";

const submitEOIPayload = {
  parentName: "Siti Rahmawati",
  email: "parent@example.com",
  whatsapp: "+62 812 3456 7890",
  locationSuburb: "South Jakarta",
  occupation: "Entrepreneur",
  hasExistingStudents: "no" as const,
  referralCode: "",
  heardFrom: "social-media",
  school: "iihs" as const,
};

const submitEOIPayloadWithExistingStudents = {
  parentName: "Arief Pratama",
  email: "arief@example.com",
  whatsapp: "+62 811 1111 1111",
  locationSuburb: "Bekasi",
  occupation: "Engineer",
  hasExistingStudents: "yes" as const,
  existingChildrenCount: 2,
  referralCode: "  REF123  ",
  heardFrom: "friend-family",
  school: "iiss" as const,
};

describe("ApiAdmissionsAuthRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gets setup context by token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        context: {
          parentName: "Siti Rahmawati",
          email: "parent@example.com",
          whatsapp: "+62 812 3456 7890",
          school: "iihs",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.getSetupContext("valid-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/admissions/auth/setup-context?token=valid-token",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("posts send OTP request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "response.setup.otp_sent",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.sendSetupOtp("valid-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/admissions/auth/setup/send-otp",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("posts verify OTP request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "response.setup.otp_verified",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.verifySetupOtp({ token: "valid-token", otp: "1234" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/admissions/auth/setup/verify-otp",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("posts Google login start request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        redirectTo: "https://accounts.google.com/o/oauth2/v2/auth",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.startGoogleLogin({ returnTo: "/dashboard/parent" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/admissions/auth/google/start",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("posts password reset request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Reset link sent",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.requestPasswordReset({ email: "parent@example.com" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/admissions/auth/request-password-reset",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("posts EOI payload to backend endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseCode: 200,
        responseMessage: "success",
        responseError: null,
        data: {
          email: "parent@example.com",
          notificationSent: true,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.submitEOI(submitEOIPayload);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/admission-service/submitAdmission",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          parentName: "Siti Rahmawati",
          email: "parent@example.com",
          whatsappNumber: "+62 812 3456 7890",
          location: "South Jakarta",
          occupation: "Entrepreneur",
          existingStudents: 0,
          hearAboutSchool: "Social Media",
          schoolSelection: "IIHS",
        }),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.email).toBe("parent@example.com");
      expect(result.notificationSent).toBe(true);
    }
  });

  it("maps existing-student EOI payload fields to submitAdmission request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseCode: 200,
        responseMessage: "submitted",
        responseError: null,
        data: {
          email: "arief@example.com",
          notificationSent: false,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test/");
    const result = await repository.submitEOI(submitEOIPayloadWithExistingStudents);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/admission-service/submitAdmission",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          parentName: "Arief Pratama",
          email: "arief@example.com",
          whatsappNumber: "+62 811 1111 1111",
          location: "Bekasi",
          occupation: "Engineer",
          existingStudents: 2,
          referralCode: "REF123",
          hearAboutSchool: "Friend / Family",
          schoolSelection: "IISS",
        }),
      }),
    );
    expect(result).toEqual({
      success: true,
      email: "arief@example.com",
      notificationSent: false,
      message: "submitted",
    });
  });

  it("uses a relative submitAdmission path when no base URL is configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseCode: 200,
        responseMessage: "success",
        responseError: null,
        data: {
          email: "parent@example.com",
          notificationSent: true,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("");
    await repository.submitEOI(submitEOIPayload);

    expect(fetchMock).toHaveBeenCalledWith(
      "/admission-service/submitAdmission",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("maps backend validation errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        responseCode: 400,
        responseMessage: "Validation failed",
        responseError: {
          fieldErrors: {
            email: "Email is already used.",
          },
        },
        data: null,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.formError).toBe("Validation failed");
      expect(result.fieldErrors?.email).toBe("Email is already used.");
    }
  });

  it("maps string envelope errors to form errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        responseCode: 409,
        responseMessage: "Duplicate lead",
        responseError: "Lead already exists.",
        data: null,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result).toEqual({
      success: false,
      formError: "Lead already exists.",
    });
  });

  it("maps object envelope errors without field errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        responseCode: 500,
        responseMessage: "Service unavailable",
        responseError: {
          formError: "Admissions service unavailable.",
        },
        data: null,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result).toEqual({
      success: false,
      formError: "Admissions service unavailable.",
    });
  });

  it("treats non-2xx response codes in a successful HTTP response as failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseCode: 422,
        responseMessage: "Validation failed",
        responseError: {
          message: "Payload rejected.",
        },
        data: null,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result).toEqual({
      success: false,
      formError: "Payload rejected.",
    });
  });

  it("returns a default failure when the submitAdmission payload is not in the expected envelope format", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result).toEqual({
      success: false,
      formError: "api.error.unable_to_process",
    });
  });

  it("returns network error on fetch failure", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network"));

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository("https://api.school.test");
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.formError).toBe("api.error.network");
    }
  });
});
