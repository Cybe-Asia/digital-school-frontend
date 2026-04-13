"use client";

import { useQuery } from "@tanstack/react-query";
import { checkVerification } from "@/features/admissions-auth/application/check-verification";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

export function useCheckVerificationQuery(admissionId: string, enabled = true) {
  return useQuery({
    queryKey: ["check-verification", admissionId],
    enabled: Boolean(admissionId) && enabled,
    retry: false,
    queryFn: async () => checkVerification(createAdmissionsAuthRepository(), admissionId),
  });
}
