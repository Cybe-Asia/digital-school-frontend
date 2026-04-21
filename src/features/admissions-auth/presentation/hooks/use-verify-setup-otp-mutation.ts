"use client";

import { useMutation } from "@tanstack/react-query";
import { verifySetupOtp } from "@/features/admissions-auth/application/verify-setup-otp";
import type { SetupOtpInput } from "@/features/admissions-auth/domain/types";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

export function useVerifySetupOtpMutation() {
  return useMutation({
    mutationFn: async (input: SetupOtpInput) => verifySetupOtp(createAdmissionsAuthRepository(), input),
  });
}
