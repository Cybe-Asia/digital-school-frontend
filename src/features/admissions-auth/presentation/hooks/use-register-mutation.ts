"use client";

import { useMutation } from "@tanstack/react-query";
import { registerParent } from "@/features/admissions-auth/application/register-parent";
import { MockAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/mock-admissions-auth-repository";
import type { RegisterFormValues } from "@/features/admissions-auth/schemas/register-schema";

const repository = new MockAdmissionsAuthRepository();

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (values: RegisterFormValues) => registerParent(repository, values),
  });
}
