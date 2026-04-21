import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type {
  AdmissionData,
  CheckVerificationResult,
  EOIInput,
  EOILeadSummary,
  EOISubmitResult,
  GoogleLoginInput,
  GoogleLoginResult,
  LoginInput,
  LoginResult,
  RequestPasswordResetInput,
  RequestPasswordResetResult,
  SendSetupOtpResult,
  SetupContext,
  SetupContextResult,
  SetupAccountInput,
  SetupAccountResult,
  SchoolCode,
  SetupOtpInput,
  SubmitStudentsInput,
  SubmitStudentsResult,
  VerifyEmailResult,
  VerifySetupOtpResult,
} from "@/features/admissions-auth/domain/types";
import type {
  AdmissionsApiErrorObject,
  AdmissionsApiFieldErrors,
  AdmissionsApiResponse,
} from "@/features/admissions-auth/infrastructure/admissions-api-contract";
import type { ServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { readCachedSetupContext } from "@/features/admissions-auth/infrastructure/setup-context-cache";

type BaseFailure = {
  success: false;
  fieldErrors?: AdmissionsApiFieldErrors;
  formError?: string;
};

type BaseSuccess = {
  success: true;
  message?: string;
  redirectTo?: string;
};

type LoginApiData = {
  jwtAccessToken: string;
  refreshToken: string;
};
type GoogleLoginApiResponse = (BaseSuccess & { redirectTo: string }) | BaseFailure;
type RequestPasswordResetApiResponse = BaseSuccess | BaseFailure;
type SetupContextApiResponse =
  | {
      success: true;
      context: SetupContext;
    }
  | BaseFailure;
type SendOtpApiData = {
  phoneNumber: string;
  otp: string;
  expiredIn: number;
};

type VerifyOtpApiData = {
  status: string;
  accessToken: string;
  admissionId: string;
  phoneNumber: string;
  jwtSessionToken: string | null;
};
type CheckVerificationApiResponse =
  | (BaseSuccess & {
      isVerified: boolean;
      admission: AdmissionData;
    })
  | BaseFailure;
type VerifyEmailApiResponse =
  | (BaseSuccess & {
      admission: {
        admissionId: string;
        email: string;
        parentName: string;
        isVerified: boolean;
      };
    })
  | BaseFailure;
type CreatePasswordApiData = {
  passwordCreated: boolean;
};

type ListEOILeadsApiResponse = {
  leads: EOILeadSummary[];
};

type SubmitEOIApiRequest = {
  parent_name: string;
  email: string;
  whatsapp: string;
  target_school_preference: string;
  location_suburb?: string;
  occupation?: string;
  hear_about_school?: string;
  referral_code?: string;
  existing_students?: number;
};

type SubmitEOIApiData = {
  lead_id: string;
  email: string;
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

type RequestEnvelopeOptions<TData, TResponse> = RequestOptions & {
  mapSuccess: (payload: AdmissionsApiResponse<TData>) => TResponse;
};

type ParsedHttpResponse = {
  ok: boolean;
  body: Record<string, unknown>;
};

const DEFAULT_FAILURE_MESSAGE = "api.error.unable_to_process";
const NETWORK_FAILURE_MESSAGE = "api.error.network";

const HEARD_FROM_LABELS: Record<EOIInput["heardFrom"], string> = {
  "social-media": "Social Media",
  "friend-family": "Friend / Family",
  "search-engine": "Search Engine",
  event: "Event",
  other: "Other",
};

export class ApiAdmissionsAuthRepository implements AdmissionsAuthRepository {
  constructor(private readonly endpoints: ServiceEndpoints) {}

  async accountStatus(email: string): Promise<import("@/features/admissions-auth/domain/ports/admissions-auth-repository").AccountStatusResult> {
    try {
      const url = `${this.endpoints.auth}/accountStatus?email=${encodeURIComponent(email)}`;
      const response = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
      const parsed = (await response.json()) as Record<string, unknown>;
      if (!response.ok || !isAdmissionsApiResponse<{ exists: boolean; hasPassword: boolean }>(parsed) || !isSuccessfulResponseCode(parsed.responseCode)) {
        return { success: false, formError: "api.error.unable_to_process" };
      }
      return { success: true, exists: Boolean(parsed.data.exists), hasPassword: Boolean(parsed.data.hasPassword) };
    } catch {
      return { success: false, formError: "api.error.network" };
    }
  }

  async login(input: LoginInput): Promise<LoginResult> {
    return this.requestEnvelope<LoginApiData, LoginResult>(
      `${this.endpoints.auth}/login`,
      {
        method: "POST",
        body: { username: input.email, password: input.password },
        mapSuccess: (payload) => ({
          success: true,
          accessToken: payload.data.jwtAccessToken,
          refreshToken: payload.data.refreshToken,
          redirectTo: "/dashboard/parent",
        }),
      },
    );
  }

  async startGoogleLogin(input: GoogleLoginInput): Promise<GoogleLoginResult> {
    return this.request<GoogleLoginApiResponse>(`${this.endpoints.auth}/googleLogin`, {
      method: "POST",
      body: input,
    });
  }

  async requestPasswordReset(input: RequestPasswordResetInput): Promise<RequestPasswordResetResult> {
    return this.request<RequestPasswordResetApiResponse>(`${this.endpoints.auth}/request-password-reset`, {
      method: "POST",
      body: input,
    });
  }

  async submitEOI(input: EOIInput): Promise<EOISubmitResult> {
    return this.requestEnvelope<SubmitEOIApiData, EOISubmitResult>("/api/v1/submitAdmission", {
      method: "POST",
      body: mapSubmitEOIRequest(input),
      mapSuccess: (payload) => ({
        success: true,
        email: payload.data.email,
        notificationSent: false,
        message: payload.responseMessage === "success" ? undefined : payload.responseMessage,
      }),
    });
  }

  async getSetupContext(admissionId: string): Promise<SetupContextResult> {
    // Read from sessionStorage cache populated by verifyEmail on the first page.
    // The backend does not have a dedicated setup-context endpoint.
    const cached = readCachedSetupContext(admissionId);

    if (cached) {
      return { success: true, context: cached };
    }

    return {
      success: false,
      formError: "api.error.unable_to_process",
    };
  }

  async sendSetupOtp(phoneNumber: string): Promise<SendSetupOtpResult> {
    return this.requestEnvelope<SendOtpApiData, SendSetupOtpResult>(
      `${this.endpoints.otp}/sendOTP`,
      {
        method: "POST",
        body: { phoneNumber },
        mapSuccess: (payload) => ({
          success: true,
          phoneNumber: payload.data.phoneNumber,
          otp: payload.data.otp,
          expiredIn: payload.data.expiredIn,
        }),
      },
    );
  }

  async verifySetupOtp(input: SetupOtpInput): Promise<VerifySetupOtpResult> {
    return this.requestEnvelope<VerifyOtpApiData, VerifySetupOtpResult>(
      `${this.endpoints.otp}/verifyOTP`,
      {
        method: "POST",
        body: { phoneNumber: input.phoneNumber, otp: input.otp },
        mapSuccess: (payload) => ({
          success: true,
          accessToken: payload.data.accessToken,
          admissionId: payload.data.admissionId,
          phoneNumber: payload.data.phoneNumber,
          jwtSessionToken: payload.data.jwtSessionToken ?? undefined,
        }),
      },
    );
  }

  async setupAccount(input: SetupAccountInput): Promise<SetupAccountResult> {
    try {
      const url = `${this.endpoints.auth}/createPassword`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.accessToken}`,
        },
        body: JSON.stringify({ newPassword: input.newPassword }),
      });

      const parsed = (await response.json()) as Record<string, unknown>;

      if (!response.ok || !isAdmissionsApiResponse<CreatePasswordApiData>(parsed) || !isSuccessfulResponseCode(parsed.responseCode)) {
        return this.toLegacyFailure(parsed) as SetupAccountResult;
      }

      const data = parsed.data as CreatePasswordApiData;
      return {
        success: true,
        accountReady: data.passwordCreated,
      };
    } catch {
      return createNetworkFailure() as SetupAccountResult;
    }
  }

  async submitStudents(input: SubmitStudentsInput): Promise<SubmitStudentsResult> {
    try {
      const url = `${this.endpoints.admission}/students`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.accessToken}`,
        },
        body: JSON.stringify({ students: input.students }),
      });

      const parsed = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        return this.toLegacyFailure(parsed) as SubmitStudentsResult;
      }

      return { success: true };
    } catch {
      return createNetworkFailure() as SubmitStudentsResult;
    }
  }

  async listEOILeads(): Promise<EOILeadSummary[]> {
    const response = await this.request<ListEOILeadsApiResponse | BaseFailure>(`${this.endpoints.admission}/leads`);

    return isLeadListResponse(response) ? response.leads : [];
  }

  async checkVerification(admissionId: string): Promise<CheckVerificationResult> {
    // The backend isVerify endpoint returns { data: boolean }, not AdmissionData.
    // We combine the boolean with cached admission data from the verifyEmail step.
    const query = new URLSearchParams({ lead_id: admissionId });
    return this.requestEnvelope<boolean, CheckVerificationResult>(
      `${this.endpoints.admission}/isVerify?${query.toString()}`,
      {
        mapSuccess: (payload) => {
          const cached = readCachedSetupContext(admissionId);
          return {
            success: true,
            isVerified: payload.data,
            admission: {
              admissionId,
              email: cached?.email ?? "",
              parentName: cached?.parentName ?? "",
              whatsappNumber: cached?.whatsapp ?? "",
              schoolSelection: cached?.school?.toUpperCase() ?? "",
              location: cached?.locationSuburb ?? null,
              occupation: cached?.occupation ?? null,
              hearAboutSchool: cached?.heardFrom ?? null,
              referralCode: cached?.referralCode ?? null,
              existingStudents: cached?.existingChildrenCount ?? null,
              isVerified: payload.data,
              createdAt: "",
              updatedAt: "",
            },
          };
        },
      },
    );
  }

  async verifyEmail(token: string): Promise<VerifyEmailResult> {
    return this.requestEnvelope<AdmissionData, VerifyEmailResult>(
      `${this.endpoints.admission}/verifyEmail/${encodeURIComponent(token)}`,
      {
        mapSuccess: (payload) => ({
          success: true,
          admission: payload.data,
        }),
      },
    );
  }

  private async request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
    try {
      const result = await this.fetchJson(path, options);

      if (!result.ok) {
        return this.toLegacyFailure(result.body) as TResponse;
      }

      return result.body as TResponse;
    } catch {
      return createNetworkFailure() as TResponse;
    }
  }

  private async requestEnvelope<TData, TResponse>(path: string, options: RequestEnvelopeOptions<TData, TResponse>): Promise<TResponse> {
    try {
      const result = await this.fetchJson(path, options);
      const parsed = result.body;

      if (!isAdmissionsApiResponse<TData>(parsed)) {
        if (!result.ok) {
          return this.toLegacyFailure(parsed) as TResponse;
        }

        return createDefaultFailure() as TResponse;
      }

      if (!result.ok || !isSuccessfulResponseCode(parsed.responseCode)) {
        return this.toEnvelopeFailure(parsed) as TResponse;
      }

      return options.mapSuccess(parsed);
    } catch {
      return createNetworkFailure() as TResponse;
    }
  }

  private async fetchJson(url: string, options: RequestOptions): Promise<ParsedHttpResponse> {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return {
      ok: response.ok,
      body: await this.parseJson(response),
    };
  }

  private toLegacyFailure(parsed: Record<string, unknown>): BaseFailure {
    return {
      success: false,
      fieldErrors: isRecord(parsed.fieldErrors) ? toFieldErrors(parsed.fieldErrors) : undefined,
      formError: getStringValue(parsed.formError) ?? getStringValue(parsed.message) ?? DEFAULT_FAILURE_MESSAGE,
    };
  }

  private toEnvelopeFailure(parsed: AdmissionsApiResponse<unknown>): BaseFailure {
    const error = parsed.responseError;

    if (typeof error === "string") {
      return {
        success: false,
        formError: error || parsed.responseMessage || DEFAULT_FAILURE_MESSAGE,
      };
    }

    if (isApiErrorObject(error)) {
      return createFailure({
        fieldErrors: error.fieldErrors,
        formError: error.formError ?? error.message ?? parsed.responseMessage ?? DEFAULT_FAILURE_MESSAGE,
      });
    }

    return createFailure({
      formError: parsed.responseMessage || DEFAULT_FAILURE_MESSAGE,
    });
  }

  private async parseJson(response: Response): Promise<Record<string, unknown>> {
    try {
      return (await response.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

function mapSubmitEOIRequest(input: EOIInput): SubmitEOIApiRequest {
  const referralCode = input.referralCode?.trim();

  return {
    parent_name: input.parentName,
    email: input.email,
    whatsapp: input.whatsapp,
    target_school_preference: toSchoolSelection(input.school),
    location_suburb: input.locationSuburb || undefined,
    occupation: input.occupation || undefined,
    hear_about_school: toHeardAboutSchool(input.heardFrom) || undefined,
    referral_code: referralCode ? referralCode : undefined,
    existing_students: toExistingStudentsCount(input) || undefined,
  };
}

function isAdmissionsApiResponse<TData>(value: Record<string, unknown>): value is AdmissionsApiResponse<TData> {
  return typeof value.responseCode === "number" && typeof value.responseMessage === "string" && "data" in value;
}

function isLeadListResponse(value: ListEOILeadsApiResponse | BaseFailure): value is ListEOILeadsApiResponse {
  return "leads" in value && Array.isArray(value.leads);
}

function isSuccessfulResponseCode(code: number): boolean {
  return code >= 200 && code < 300;
}

function toExistingStudentsCount(input: EOIInput): number {
  if (input.hasExistingStudents === "no") {
    return 0;
  }

  return input.existingChildrenCount ?? 1;
}

function toHeardAboutSchool(value: EOIInput["heardFrom"]): string {
  return HEARD_FROM_LABELS[value] ?? value;
}

function toSchoolSelection(value: SchoolCode): Uppercase<SchoolCode> {
  return value.toUpperCase() as Uppercase<SchoolCode>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiErrorObject(value: unknown): value is AdmissionsApiErrorObject {
  return isRecord(value);
}

function toFieldErrors(value: Record<string, unknown>): AdmissionsApiFieldErrors {
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function createFailure(overrides: Partial<BaseFailure> = {}): BaseFailure {
  return {
    success: false,
    ...overrides,
  };
}

function createDefaultFailure(): BaseFailure {
  return createFailure({
    formError: DEFAULT_FAILURE_MESSAGE,
  });
}

function createNetworkFailure(): BaseFailure {
  return createFailure({
    formError: NETWORK_FAILURE_MESSAGE,
  });
}
