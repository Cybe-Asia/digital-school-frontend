"use client";

import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "@/features/admissions-auth/application/request-password-reset";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";
import type { RequestPasswordResetFormValues } from "@/features/admissions-auth/schemas/request-password-reset-schema";

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: async (values: RequestPasswordResetFormValues) =>
      requestPasswordReset(createAdmissionsAuthRepository(), values),
  });
}
