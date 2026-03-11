"use client";

import { useMutation } from "@tanstack/react-query";
import { setupAccount } from "@/features/admissions-auth/application/setup-account";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";
import type { SetupAccountFormValues } from "@/features/admissions-auth/schemas/setup-account-schema";

const repository = createAdmissionsAuthRepository();

export function useSetupAccountMutation() {
  return useMutation({
    mutationFn: async (values: SetupAccountFormValues) => setupAccount(repository, values),
  });
}
