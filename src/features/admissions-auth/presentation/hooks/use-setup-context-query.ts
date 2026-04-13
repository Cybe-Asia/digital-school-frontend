"use client";

import { useQuery } from "@tanstack/react-query";
import { getSetupContext } from "@/features/admissions-auth/application/get-setup-context";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

const repository = createAdmissionsAuthRepository();

export function useSetupContextQuery(token: string, enabled = true) {
  return useQuery({
    queryKey: ["setup-context", token],
    enabled: Boolean(token) && enabled,
    retry: false,
    queryFn: async () => getSetupContext(repository, token),
  });
}
