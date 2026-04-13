"use client";

import { useMutation } from "@tanstack/react-query";
import { submitStudents } from "@/features/admissions-auth/application/submit-students";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";
import type { SubmitStudentsInput } from "@/features/admissions-auth/domain/types";

export function useSubmitStudentsMutation() {
  return useMutation({
    mutationFn: async (input: SubmitStudentsInput) => submitStudents(createAdmissionsAuthRepository(), input),
  });
}
