"use client";

import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "@/features/admissions-auth/application/verify-email";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: async (token: string) => verifyEmail(createAdmissionsAuthRepository(), token),
  });
}
