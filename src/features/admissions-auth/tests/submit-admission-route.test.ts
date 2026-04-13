import { POST } from "@/app/api/v1/submitAdmission/route";

const submitAdmissionPayload = {
  parentName: "John Doe",
  email: "parent@email.com",
  whatsappNumber: "628123456789",
  location: "Jakarta",
  occupation: "Engineer",
  existingStudents: 0,
  referralCode: "REF123",
  hearAboutSchool: "Instagram",
  schoolSelection: "IIHS",
};

describe("submitAdmission route", () => {
  const originalBaseUrl = process.env.ADMISSIONS_API_BASE_URL;
  const originalPublicBaseUrl = process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL;

  afterEach(() => {
    process.env.ADMISSIONS_API_BASE_URL = originalBaseUrl;
    process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL = originalPublicBaseUrl;
    vi.unstubAllGlobals();
  });

  it("proxies submissions to the configured admissions backend", async () => {
    process.env.ADMISSIONS_API_BASE_URL = "http://localhost:8080/";

    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      text: async () =>
        JSON.stringify({
          responseCode: 200,
          responseMessage: "success",
          responseError: null,
          data: {
            admissionId: "abc-123",
            email: "parent@email.com",
          },
        }),
      headers: new Headers({
        "content-type": "application/json",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("http://localhost:3000/api/v1/submitAdmission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitAdmissionPayload),
    });

    const response = await POST(request);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/admission-service/submitForm",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(submitAdmissionPayload),
        cache: "no-store",
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      responseCode: 200,
      responseMessage: "success",
      responseError: null,
      data: {
        admissionId: "abc-123",
        email: "parent@email.com",
      },
    });
  });

  it("falls back to the public admissions base url when the server-only one is unset", async () => {
    delete process.env.ADMISSIONS_API_BASE_URL;
    process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL = "http://localhost:8080";

    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ responseCode: 200, responseMessage: "success", responseError: null, data: {} }),
      headers: new Headers({
        "content-type": "application/json",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await POST(
      new Request("http://localhost:3000/api/v1/submitAdmission", {
        method: "POST",
        body: JSON.stringify(submitAdmissionPayload),
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/admission-service/submitForm",
      expect.any(Object),
    );
  });

  it("passes backend validation failures through to the caller", async () => {
    process.env.ADMISSIONS_API_BASE_URL = "http://localhost:8080";

    const fetchMock = vi.fn().mockResolvedValue({
      status: 400,
      text: async () =>
        JSON.stringify({
          responseCode: 400,
          responseMessage: "failed",
          responseError: "schoolSelection is required",
          data: null,
        }),
      headers: new Headers({
        "content-type": "application/json",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/submitAdmission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitAdmissionPayload),
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/admission-service/submitForm",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(submitAdmissionPayload),
        cache: "no-store",
      }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      responseCode: 400,
      responseMessage: "failed",
      responseError: "schoolSelection is required",
      data: null,
    });
  });
});
