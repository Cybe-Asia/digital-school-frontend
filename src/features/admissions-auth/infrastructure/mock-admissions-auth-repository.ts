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
  SetupContextResult,
  SetupAccountInput,
  SetupAccountResult,
  SetupOtpInput,
  VerifySetupOtpResult,
} from "@/features/admissions-auth/domain/types";
import { readMockSetupContext, saveMockSetupContext } from "@/features/admissions-auth/infrastructure/mock-setup-context-store";

const WAIT_TIME_MS = 450;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, WAIT_TIME_MS));
}

export class MockAdmissionsAuthRepository implements AdmissionsAuthRepository {
  async login(input: LoginInput): Promise<LoginResult> {
    await wait();

    if (input.email.toLowerCase() === "locked@cybe.school") {
      return {
        success: false,
        formError: "response.login.locked",
      };
    }

    return {
      success: true,
      redirectTo: "/dashboard/parent",
      message: "response.login.success",
    };
  }

  async startGoogleLogin(input: GoogleLoginInput): Promise<GoogleLoginResult> {
    await wait();

    return {
      success: true,
      redirectTo: `/auth/google/callback?provider=google&state=mock${input.returnTo ? `&returnTo=${encodeURIComponent(input.returnTo)}` : ""}`,
      message: "response.google.start_success",
    };
  }

  async requestPasswordReset(input: RequestPasswordResetInput): Promise<RequestPasswordResetResult> {
    await wait();

    if (input.email.toLowerCase() === "unknown@cybe.school") {
      return {
        success: false,
        fieldErrors: {
          email: "response.reset.not_found",
        },
      };
    }

    return {
      success: true,
      message: "response.reset.success",
    };
  }

  async submitEOI(input: EOIInput): Promise<EOISubmitResult> {
    await wait();

    if (input.email.toLowerCase() === "existing@cybe.school") {
      return {
        success: false,
        fieldErrors: {
          email: "response.eoi.exists",
        },
      };
    }

    saveMockSetupContext(input);

    return {
      success: true,
      email: input.email,
      notificationSent: true,
      message: "response.eoi.success",
    };
  }

  async getSetupContext(token: string): Promise<SetupContextResult> {
    await wait();

    if (!token || token === "expired-token") {
      return {
        success: false,
        formError: "response.setup.expired",
      };
    }

    const savedContext = readMockSetupContext(token);

    if (savedContext) {
      return {
        success: true,
        context: savedContext,
      };
    }

    return {
      success: true,
      context: {
        parentName: "Siti Rahmawati",
        email: "parent@example.com",
        whatsapp: "+62 812 3456 7890",
        locationSuburb: "South Jakarta",
        occupation: "Entrepreneur",
        hasExistingStudents: "no",
        referralCode: "",
        heardFrom: "social-media",
        school: "iihs",
      },
    };
  }

  async sendSetupOtp(token: string): Promise<SendSetupOtpResult> {
    await wait();

    if (!token || token === "expired-token") {
      return {
        success: false,
        formError: "response.setup.expired",
      };
    }

    return {
      success: true,
      message: "response.setup.otp_sent",
    };
  }

  async verifySetupOtp(input: SetupOtpInput): Promise<VerifySetupOtpResult> {
    await wait();

    if (!input.token || input.token === "expired-token") {
      return {
        success: false,
        formError: "response.setup.expired",
      };
    }

    if (input.otp !== "1234") {
      return {
        success: false,
        fieldErrors: {
          otp: "validation.setup.otp_invalid",
        },
      };
    }

    return {
      success: true,
      message: "response.setup.otp_verified",
    };
  }

  async setupAccount(input: SetupAccountInput): Promise<SetupAccountResult> {
    await wait();

    if (!input.token || input.token === "expired-token") {
      return {
        success: false,
        formError: "response.setup.expired",
      };
    }

    if (input.password !== input.confirmPassword) {
      return {
        success: false,
        fieldErrors: {
          confirmPassword: "validation.setup.password_mismatch",
        },
      };
    }

    return {
      success: true,
      accountReady: true,
      redirectTo: "/dashboard/parent",
      message: "response.setup.success",
    };
  }

  async listEOILeads(): Promise<EOILeadSummary[]> {
    await wait();

    return [];
  }
}
