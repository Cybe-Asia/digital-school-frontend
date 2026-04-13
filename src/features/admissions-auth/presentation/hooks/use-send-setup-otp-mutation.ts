"use client";

import { useMutation } from "@tanstack/react-query";
import { sendSetupOtp } from "@/features/admissions-auth/application/send-setup-otp";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

const repository = createAdmissionsAuthRepository();

export function useSendSetupOtpMutation() {
  return useMutation({
    mutationFn: async (token: string) => sendSetupOtp(repository, token),
  });
}
