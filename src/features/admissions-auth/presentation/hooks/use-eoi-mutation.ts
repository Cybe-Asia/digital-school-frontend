"use client";

import { useMutation } from "@tanstack/react-query";
import { submitEOI } from "@/features/admissions-auth/application/submit-eoi";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";
import type { EOIFormValues } from "@/features/admissions-auth/schemas/eoi-schema";

const repository = createAdmissionsAuthRepository();

export function useEOIMutation() {
  return useMutation({
    mutationFn: async (values: EOIFormValues) => submitEOI(repository, values),
  });
}
