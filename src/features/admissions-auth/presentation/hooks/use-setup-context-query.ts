"use client";

import { useQuery } from "@tanstack/react-query";
import { getSetupContext } from "@/features/admissions-auth/application/get-setup-context";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

export function useSetupContextQuery(admissionId: string, enabled = true) {
  return useQuery({
    queryKey: ["setup-context", admissionId],
    enabled: Boolean(admissionId) && enabled,
    retry: false,
    queryFn: async () => getSetupContext(createAdmissionsAuthRepository(), admissionId),
  });
}
