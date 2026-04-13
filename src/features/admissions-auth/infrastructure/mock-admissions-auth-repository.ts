import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type {
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
  SetupContextResult,
  SetupAccountInput,
  SetupAccountResult,
  SetupOtpInput,
  SubmitStudentsInput,
  SubmitStudentsResult,
  VerifyEmailResult,
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
      accessToken: "mock-jwt-access-token",
      refreshToken: "mock-refresh-token",
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

  async getSetupContext(admissionId: string): Promise<SetupContextResult> {
    await wait();

    if (!admissionId || admissionId === "expired-token") {
      return {
        success: false,
        formError: "response.setup.expired",
      };
    }

    const savedContext = readMockSetupContext(admissionId);

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

  async sendSetupOtp(phoneNumber: string): Promise<SendSetupOtpResult> {
    await wait();

    if (!phoneNumber) {
      return {
        success: false,
        formError: "response.setup.missing_phone",
      };
    }

    return {
      success: true,
      phoneNumber,
      otp: "1234",
      expiredIn: 300,
    };
  }

  async verifySetupOtp(input: SetupOtpInput): Promise<VerifySetupOtpResult> {
    await wait();

    if (!input.phoneNumber) {
      return {
        success: false,
        formError: "response.setup.missing_phone",
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
      accessToken: "mock-jwt-token",
      admissionId: "mock-admission-id",
      phoneNumber: input.phoneNumber,
      jwtSessionToken: "mock-session-token",
    };
  }

  async setupAccount(input: SetupAccountInput): Promise<SetupAccountResult> {
    await wait();

    if (!input.accessToken) {
      return {
        success: false,
        formError: "response.setup.expired",
      };
    }

    if (!input.newPassword || input.newPassword.length < 8) {
      return {
        success: false,
        formError: "validation.setup.password_min",
      };
    }

    return {
      success: true,
      accountReady: true,
      redirectTo: "/dashboard/parent",
      message: "response.setup.success",
    };
  }

  async submitStudents(input: SubmitStudentsInput): Promise<SubmitStudentsResult> {
    await wait();

    if (!input.accessToken) {
      return {
        success: false,
        formError: "response.setup.expired",
      };
    }

    if (input.students.length === 0) {
      return {
        success: false,
        formError: "validation.additional.students_min",
      };
    }

    return {
      success: true,
      message: "response.additional.students_submitted",
    };
  }

  async listEOILeads(): Promise<EOILeadSummary[]> {
    await wait();

    return [];
  }

  async checkVerification(admissionId: string): Promise<CheckVerificationResult> {
    await wait();

    if (!admissionId) {
      return {
        success: false,
        formError: "response.verification.missing_id",
      };
    }

    return {
      success: true,
      isVerified: false,
      admission: {
        admissionId: "mock-hashed-admission-id",
        email: "parent@example.com",
        parentName: "Siti Rahmawati",
        whatsappNumber: "628123456789",
        schoolSelection: "IIHS",
        location: "South Jakarta",
        occupation: "Entrepreneur",
        hearAboutSchool: "Social Media",
        referralCode: null,
        existingStudents: 0,
        isVerified: false,
        createdAt: "2026-04-06T10:30:00Z",
        updatedAt: "2026-04-06T10:30:00Z",
      },
    };
  }

  async verifyEmail(token: string): Promise<VerifyEmailResult> {
    await wait();

    if (!token || token === "invalid-token") {
      return {
        success: false,
        formError: "response.verification.invalid_token",
      };
    }

    return {
      success: true,
      admission: {
        admissionId: "mock-admission-id",
        email: "parent@example.com",
        parentName: "Siti Rahmawati",
        whatsappNumber: "+628123456789",
        schoolSelection: "IISS",
        location: "South Jakarta",
        occupation: "Engineer",
        hearAboutSchool: "Social Media",
        referralCode: null,
        existingStudents: 0,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
