"use client";

import { useMutation } from "@tanstack/react-query";

/**
 * Hook for the parent-side "Add another child" action.
 *
 * POSTs to the Next.js proxy `/api/applications` (which forwards the
 * HttpOnly session cookie as Authorization: Bearer to admission-service).
 * The backend creates a new Lead under the same User and returns the new
 * admissionId; the caller then routes the parent to the students form
 * for that new application.
 */
export type CreateApplicationInput = {
  /** Optional — override the school for this application. */
  targetSchoolPreference?: string;
};

export type CreateApplicationResult = {
  admissionId: string;
  schoolSelection: string;
};

type AdmissionEnvelope<T> = {
  responseCode: number;
  responseMessage: string;
  data?: T;
};

type AdmissionData = {
  admissionId: string;
  schoolSelection: string;
};

export function useCreateApplicationMutation() {
  return useMutation({
    mutationFn: async (input: CreateApplicationInput): Promise<CreateApplicationResult> => {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSchoolPreference: input.targetSchoolPreference,
        }),
      });
      const body = (await res.json()) as AdmissionEnvelope<AdmissionData>;
      if (!res.ok || body.responseCode >= 400 || !body.data) {
        throw new Error(body.responseMessage || `HTTP ${res.status}`);
      }
      return {
        admissionId: body.data.admissionId,
        schoolSelection: body.data.schoolSelection,
      };
    },
  });
}
