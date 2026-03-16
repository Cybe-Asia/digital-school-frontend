"use client";

import { useMutation } from "@tanstack/react-query";
import { loginParent } from "@/features/admissions-auth/application/login-parent";
import { MockAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/mock-admissions-auth-repository";
import type { LoginFormValues } from "@/features/admissions-auth/schemas/login-schema";

const repository = new MockAdmissionsAuthRepository();

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (values: LoginFormValues) => loginParent(repository, values),
  });
}
