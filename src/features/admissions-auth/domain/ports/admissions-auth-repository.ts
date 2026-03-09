import type { LoginInput, LoginResult, RegisterInput, RegisterResult } from "@/features/admissions-auth/domain/types";

export interface AdmissionsAuthRepository {
  login(input: LoginInput): Promise<LoginResult>;
  register(input: RegisterInput): Promise<RegisterResult>;
}
