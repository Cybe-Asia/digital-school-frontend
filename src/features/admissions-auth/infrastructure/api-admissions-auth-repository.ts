import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type {
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
  VerifySetupOtpResult,
} from "@/features/admissions-auth/domain/types";
import type {
  AdmissionsApiErrorObject,
  AdmissionsApiFieldErrors,
  AdmissionsApiResponse,
} from "@/features/admissions-auth/infrastructure/admissions-api-contract";

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

type LoginApiResponse = BaseSuccess | BaseFailure;
type GoogleLoginApiResponse = (BaseSuccess & { redirectTo: string }) | BaseFailure;
type RequestPasswordResetApiResponse = BaseSuccess | BaseFailure;
type SetupContextApiResponse =
  | {
      success: true;
      context: SetupContext;
    }
  | BaseFailure;
type SendSetupOtpApiResponse = BaseSuccess | BaseFailure;
type VerifySetupOtpApiResponse = BaseSuccess | BaseFailure;
type SetupAccountApiResponse =
  | (BaseSuccess & {
      accountReady: boolean;
    })
  | BaseFailure;

type ListEOILeadsApiResponse = {
  leads: EOILeadSummary[];
};

type SubmitEOIApiRequest = {
  parentName: string;
  email: string;
  whatsappNumber: string;
  location: string;
  occupation: string;
  existingStudents: number;
  referralCode?: string;
  hearAboutSchool: string;
  schoolSelection: Uppercase<EOIInput["school"]>;
};

type SubmitEOIApiData = {
  email: string;
  notificationSent: boolean;
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
  constructor(private readonly baseUrl: string) {}

  async login(input: LoginInput): Promise<LoginResult> {
    return this.request<LoginApiResponse>("/admissions/auth/login", {
      method: "POST",
      body: input,
    });
  }

  async startGoogleLogin(input: GoogleLoginInput): Promise<GoogleLoginResult> {
    return this.request<GoogleLoginApiResponse>("/admissions/auth/google/start", {
      method: "POST",
      body: input,
    });
  }

  async requestPasswordReset(input: RequestPasswordResetInput): Promise<RequestPasswordResetResult> {
    return this.request<RequestPasswordResetApiResponse>("/admissions/auth/request-password-reset", {
      method: "POST",
      body: input,
    });
  }

  async submitEOI(input: EOIInput): Promise<EOISubmitResult> {
    return this.requestEnvelope<SubmitEOIApiData, EOISubmitResult>("/admission-service/submitAdmission", {
      method: "POST",
      body: mapSubmitEOIRequest(input),
      mapSuccess: (payload) => ({
        success: true,
        email: payload.data.email,
        notificationSent: payload.data.notificationSent,
        message: payload.responseMessage === "success" ? undefined : payload.responseMessage,
      }),
    });
  }

  async getSetupContext(token: string): Promise<SetupContextResult> {
    const query = new URLSearchParams({ token });
    return this.request<SetupContextApiResponse>(`/admissions/auth/setup-context?${query.toString()}`);
  }

  async sendSetupOtp(token: string): Promise<SendSetupOtpResult> {
    return this.request<SendSetupOtpApiResponse>("/admissions/auth/setup/send-otp", {
      method: "POST",
      body: { token },
    });
  }

  async verifySetupOtp(input: SetupOtpInput): Promise<VerifySetupOtpResult> {
    return this.request<VerifySetupOtpApiResponse>("/admissions/auth/setup/verify-otp", {
      method: "POST",
      body: input,
    });
  }

  async setupAccount(input: SetupAccountInput): Promise<SetupAccountResult> {
    return this.request<SetupAccountApiResponse>("/admissions/auth/setup-account", {
      method: "POST",
      body: input,
    });
  }

  async listEOILeads(): Promise<EOILeadSummary[]> {
    const response = await this.request<ListEOILeadsApiResponse | BaseFailure>("/admissions/eoi/leads");

    return isLeadListResponse(response) ? response.leads : [];
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

  private async fetchJson(path: string, options: RequestOptions): Promise<ParsedHttpResponse> {
    const response = await fetch(this.toAbsoluteUrl(path), {
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

  private toAbsoluteUrl(path: string): string {
    if (!this.baseUrl) {
      return path;
    }

    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
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
    parentName: input.parentName,
    email: input.email,
    whatsappNumber: input.whatsapp,
    location: input.locationSuburb,
    occupation: input.occupation,
    existingStudents: toExistingStudentsCount(input),
    referralCode: referralCode ? referralCode : undefined,
    hearAboutSchool: toHeardAboutSchool(input.heardFrom),
    schoolSelection: toSchoolSelection(input.school),
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
