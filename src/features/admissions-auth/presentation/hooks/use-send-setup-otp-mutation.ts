"use client";

import { useMutation } from "@tanstack/react-query";
import { sendSetupOtp } from "@/features/admissions-auth/application/send-setup-otp";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

export function useSendSetupOtpMutation() {
  return useMutation({
    mutationFn: async (phoneNumber: string) => sendSetupOtp(createAdmissionsAuthRepository(), phoneNumber),
  });
}
