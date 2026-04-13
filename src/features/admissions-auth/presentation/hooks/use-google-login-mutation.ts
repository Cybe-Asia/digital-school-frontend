"use client";

import { useMutation } from "@tanstack/react-query";
import { startGoogleLogin } from "@/features/admissions-auth/application/start-google-login";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: async (returnTo?: string) => startGoogleLogin(createAdmissionsAuthRepository(), { returnTo }),
  });
}
