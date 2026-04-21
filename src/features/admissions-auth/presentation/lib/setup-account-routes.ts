import type { AdmissionsStudentProfile } from "@/features/admissions-auth/domain/types";
import { getSingleSearchParam, type SearchParamsRecord } from "@/shared/lib/search-params";

export function getSetupAdmissionIdFromSearchParams(searchParams: SearchParamsRecord) {
  return getSingleSearchParam(searchParams.admissionId) ?? "";
}

export function getSetupTokenFromSearchParams(searchParams: SearchParamsRecord) {
  return getSingleSearchParam(searchParams.token) ?? "";
}

export function getSetupOtpHref(admissionId: string, phoneNumber?: string) {
  const params = new URLSearchParams({ admissionId });
  if (phoneNumber) {
    params.set("phone", phoneNumber);
  }
  return `/auth/setup-account/otp?${params.toString()}`;
}

export function getSetupMethodHref(admissionId: string) {
  return `/auth/setup-account/method?admissionId=${encodeURIComponent(admissionId)}`;
}

export function getSetupAdditionalFormHref(admissionId: string) {
  return `/auth/setup-account/additional?admissionId=${encodeURIComponent(admissionId)}`;
}

export function getSetupPaymentHref(admissionId: string) {
  return `/auth/setup-account/payment?admissionId=${encodeURIComponent(admissionId)}`;
}

export function getSetupPaymentReturnHref(paymentId: string, status?: string) {
  const params = new URLSearchParams({ paymentId });
  if (status) params.set("status", status);
  return `/auth/setup-account/payment/return?${params.toString()}`;
}

export type ParentDashboardNavigationPayload = {
  parentName: string;
  email: string;
  school: "iihs" | "iiss";
  students: AdmissionsStudentProfile[];
  hasExistingStudents: "yes" | "no";
  existingChildrenCount?: number;
  locationSuburb: string;
  notes?: string;
};

export function getParentDashboardHref(payload: ParentDashboardNavigationPayload) {
  const primaryStudent = payload.students[0];
  const params = new URLSearchParams({
    parentName: payload.parentName,
    email: payload.email,
    school: payload.school,
    hasExistingStudents: payload.hasExistingStudents,
    locationSuburb: payload.locationSuburb,
    students: JSON.stringify(payload.students),
  });

  if (primaryStudent) {
    params.set("studentName", primaryStudent.studentName);
    params.set("currentSchool", primaryStudent.currentSchool);
    params.set("targetGrade", primaryStudent.targetGrade);
  }

  if (payload.existingChildrenCount !== undefined) {
    params.set("existingChildrenCount", String(payload.existingChildrenCount));
  }

  return `/dashboard/parent?${params.toString()}`;
}
