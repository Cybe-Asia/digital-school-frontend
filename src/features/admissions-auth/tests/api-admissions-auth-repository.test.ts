import { ApiAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/api-admissions-auth-repository";
import type { ServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const TEST_ENDPOINTS: ServiceEndpoints = {
  admission: "https://api.school.test/api/leads/v1",
  otp: "https://api.school.test/api/v1/otp-service",
  auth: "https://api.school.test/api/v1/auth-service",
  notification: "https://api.school.test/api/email/v1",
};

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

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.getSetupContext("valid-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.school.test/api/leads/v1/setup-context?admissionId=valid-token",
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
        responseCode: 200,
        responseMessage: "success",
        responseError: null,
        data: {
          phoneNumber: "628123456789",
          otp: "4832",
          expiredIn: 300,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.sendSetupOtp("628123456789");

    expect(fetchMock).toHaveBeenCalledWith(
      `${TEST_ENDPOINTS.otp}/sendOTP`,
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.phoneNumber).toBe("628123456789");
      expect(result.otp).toBe("4832");
      expect(result.expiredIn).toBe(300);
    }
  });

  it("posts verify OTP request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseCode: 200,
        responseMessage: "success",
        responseError: null,
        data: {
          status: "SUCCESS",
          accessToken: "jwt-token",
          admissionId: "admission-123",
          phoneNumber: "628123456789",
          jwtSessionToken: "session-token",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.verifySetupOtp({ phoneNumber: "628123456789", otp: "1234" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${TEST_ENDPOINTS.otp}/verifyOTP`,
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.accessToken).toBe("jwt-token");
      expect(result.admissionId).toBe("admission-123");
    }
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

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.startGoogleLogin({ returnTo: "/dashboard/parent" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${TEST_ENDPOINTS.auth}/googleLogin`,
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

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.requestPasswordReset({ email: "parent@example.com" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${TEST_ENDPOINTS.auth}/request-password-reset`,
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
          lead_id: "lead-123",
          email: "parent@example.com",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.submitEOI(submitEOIPayload);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/submitAdmission",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          parent_name: "Siti Rahmawati",
          email: "parent@example.com",
          whatsapp: "+62 812 3456 7890",
          target_school_preference: "IIHS",
          location_suburb: "South Jakarta",
          occupation: "Entrepreneur",
          hear_about_school: "Social Media",
        }),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.email).toBe("parent@example.com");
      expect(result.notificationSent).toBe(false);
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
          lead_id: "lead-456",
          email: "arief@example.com",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.submitEOI(submitEOIPayloadWithExistingStudents);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/submitAdmission",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          parent_name: "Arief Pratama",
          email: "arief@example.com",
          whatsapp: "+62 811 1111 1111",
          target_school_preference: "IISS",
          location_suburb: "Bekasi",
          occupation: "Engineer",
          hear_about_school: "Friend / Family",
          referral_code: "REF123",
          existing_students: 2,
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
          lead_id: "lead-abc",
          email: "parent@example.com",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const emptyEndpoints: ServiceEndpoints = { admission: "", otp: "", auth: "", notification: "" };
    const repository = new ApiAdmissionsAuthRepository(emptyEndpoints);
    await repository.submitEOI(submitEOIPayload);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/submitAdmission",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("defaults notificationSent to false when the backend omits it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseCode: 200,
        responseMessage: "success",
        responseError: null,
        data: {
          lead_id: "lead-789",
          email: "parent@example.com",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result).toEqual({
      success: true,
      email: "parent@example.com",
      notificationSent: false,
      message: undefined,
    });
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

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
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

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
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

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
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

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
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

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result).toEqual({
      success: false,
      formError: "api.error.unable_to_process",
    });
  });

  it("returns network error on fetch failure", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network"));

    vi.stubGlobal("fetch", fetchMock);

    const repository = new ApiAdmissionsAuthRepository(TEST_ENDPOINTS);
    const result = await repository.submitEOI(submitEOIPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.formError).toBe("api.error.network");
    }
  });
});
