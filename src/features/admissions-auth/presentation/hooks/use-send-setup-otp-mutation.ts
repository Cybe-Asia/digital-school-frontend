"use client";

import { useMutation } from "@tanstack/react-query";
import { sendSetupOtp } from "@/features/admissions-auth/application/send-setup-otp";
import type { SendSetupOtpInput } from "@/features/admissions-auth/domain/types";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

export function useSendSetupOtpMutation() {
  return useMutation({
    mutationFn: async (input: SendSetupOtpInput) => sendSetupOtp(createAdmissionsAuthRepository(), input),
  });
}
