import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { LoginInput, LoginResult, RegisterInput, RegisterResult } from "@/features/admissions-auth/domain/types";

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
        formError: "This account needs help from admissions before it can sign in.",
      };
    }

    return {
      success: true,
      redirectTo: "/dashboard/parent",
      message: "Login accepted. Admissions dashboard access will connect in the next phase.",
    };
  }

  async register(input: RegisterInput): Promise<RegisterResult> {
    await wait();

    if (input.email.toLowerCase() === "existing@cybe.school") {
      return {
        success: false,
        fieldErrors: {
          email: "This email already has an admissions account.",
        },
      };
    }

    return {
      success: true,
      redirectTo: "/admissions/login",
      message: `Account created for ${input.fullName}. Continue to sign in.`,
    };
  }
}
