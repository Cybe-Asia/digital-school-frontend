"use client";

import { useMutation } from "@tanstack/react-query";
import { setupAccount } from "@/features/admissions-auth/application/setup-account";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";
import type { SetupAccountInput } from "@/features/admissions-auth/domain/types";

export function useSetupAccountMutation() {
  return useMutation({
    mutationFn: async (input: SetupAccountInput) => setupAccount(createAdmissionsAuthRepository(), input),
  });
}
