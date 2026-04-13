"use client";

import { useMutation } from "@tanstack/react-query";
import { verifySetupOtp } from "@/features/admissions-auth/application/verify-setup-otp";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";
import type { SetupOtpFormValues } from "@/features/admissions-auth/schemas/setup-otp-schema";

const repository = createAdmissionsAuthRepository();

export function useVerifySetupOtpMutation() {
  return useMutation({
    mutationFn: async (values: SetupOtpFormValues) => verifySetupOtp(repository, values),
  });
}
