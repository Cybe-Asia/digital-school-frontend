"use client";

import { useMutation } from "@tanstack/react-query";
import { loginParent } from "@/features/admissions-auth/application/login-parent";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";
import type { LoginFormValues } from "@/features/admissions-auth/schemas/login-schema";

const repository = createAdmissionsAuthRepository();

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (values: LoginFormValues) => loginParent(repository, values),
  });
}
