"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useSetupContextQuery } from "@/features/admissions-auth/presentation/hooks/use-setup-context-query";
import { useSubmitStudentsMutation } from "@/features/admissions-auth/presentation/hooks/use-submit-students-mutation";
import { getSetupMethodHref, getSetupPaymentHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { getSetupAccessToken } from "@/features/admissions-auth/presentation/lib/setup-otp-session";
import {
  additionalDetailsSchema,
  type AdditionalDetailsFormValues,
} from "@/features/admissions-auth/schemas/additional-details-schema";
import { useI18n } from "@/i18n";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { FormField } from "./form-field";
import { SetupContextSummary } from "./setup-context-summary";

const TARGET_GRADE_OPTIONS = ["year7", "year8", "year9", "year10", "year11", "year12"] as const;

type SetupAccountAdditionalFormProps = {
  admissionId: string;
};

export function SetupAccountAdditionalForm({ admissionId }: SetupAccountAdditionalFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const accessToken = getSetupAccessToken(admissionId);

  const setupContextQuery = useSetupContextQuery(admissionId, Boolean(admissionId));
  const submitStudentsMutation = useSubmitStudentsMutation();
  const contextSuccess = setupContextQuery.data?.success ? setupContextQuery.data : null;
  const contextFailure = setupContextQuery.data && !setupContextQuery.data.success ? setupContextQuery.data : null;
  const submitFailure = submitStudentsMutation.data && !submitStudentsMutation.data.success ? submitStudentsMutation.data : null;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdditionalDetailsFormValues>({
    resolver: zodResolver(additionalDetailsSchema),
    defaultValues: {
      accessToken,
      students: [
        {
          studentName: "",
          studentBirthDate: "",
          currentSchool: "",
          targetGrade: "",
          notes: "",
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });
  const students = useWatch({
    control,
    name: "students",
  });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const activeExpandedIndex =
    expandedIndex === null ? null : Math.min(expandedIndex, Math.max(fields.length - 1, 0));

  const onSubmit = handleSubmit(
    async (values) => {
      if (!contextSuccess) {
        return;
      }

      const result = await submitStudentsMutation.mutateAsync({
        accessToken: values.accessToken,
        students: values.students.map((s) => ({
          fullName: s.studentName,
          dateOfBirth: s.studentBirthDate,
          currentSchool: s.currentSchool,
          targetGradeLevel: s.targetGrade,
          notes: s.notes ?? "",
        })),
      });

      if (!result.success) {
        return;
      }

      // After students are saved, the parent must pay the registration fee
      // before reaching the dashboard. Real parent data is loaded on the
      // dashboard from the backend /me endpoint, so we no longer need to
      // pass profile fields through the URL.
      router.push(getSetupPaymentHref(admissionId));
    },
    (invalidErrors) => {
      if (!Array.isArray(invalidErrors.students)) {
        return;
      }

      const firstInvalidIndex = invalidErrors.students.findIndex((studentError) => Boolean(studentError));

      if (firstInvalidIndex >= 0) {
        setExpandedIndex(firstInvalidIndex);
      }
    },
  );

  if (!admissionId) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {t("auth.setup.missing_token")}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {setupContextQuery.isLoading ? <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.setup.loading_context")}</p> : null}

      {contextFailure?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t(contextFailure.formError)}
        </div>
      ) : null}

      {contextSuccess ? (
        <>
          <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t("auth.additional.context_title")}</p>
            <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t("auth.additional.context_hint")}</p>
          </div>

          <SetupContextSummary context={contextSuccess.context} />

          {submitFailure?.formError ? (
            <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
              {t(submitFailure.formError)}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <input type="hidden" {...register("accessToken")} />

            <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-4">
              <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t("auth.additional.form_title")}</p>
              <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t("auth.additional.form_hint")}</p>
            </div>

            {errors.students?.message ? (
              <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
                {t(errors.students.message)}
              </div>
            ) : null}

            {fields.map((field, index) => {
              const student = students?.[index];
              const isExpanded = activeExpandedIndex === index;
              const hasStudentErrors = Boolean(errors.students?.[index]);
              const panelId = `student-panel-${field.id}`;
              const studentTitle = student?.studentName?.trim() || t("auth.additional.student_section_title", { number: index + 1 });
              const studentMeta = [student?.currentSchool?.trim(), student?.targetGrade ? t(`auth.additional.target_grade.${student.targetGrade}`) : null]
                .filter(Boolean)
                .join(" • ");

              return (
                <div
                  key={field.id}
                  className={cn(
                    "rounded-2xl border bg-[var(--ds-surface)] transition",
                    hasStudentErrors ? "border-[#b42318]/30 shadow-[0_0_0_1px_rgba(180,35,24,0.08)]" : "border-[var(--ds-border)]",
                  )}
                >
                  <div className="flex items-start gap-3 px-4 py-4">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      aria-label={t(isExpanded ? "auth.additional.collapse_student" : "auth.additional.expand_student", {
                        student: t("auth.additional.student_section_title", { number: index + 1 }),
                      })}
                      onClick={() => setExpandedIndex((current) => (current === index ? null : index))}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{studentTitle}</p>
                        <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                          {studentMeta || t("auth.additional.student_card_summary_empty")}
                        </p>
                        {hasStudentErrors ? (
                          <p className="mt-2 text-xs font-semibold text-[#b42318]">{t("auth.additional.student_card_error")}</p>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--ds-border)] bg-[var(--ds-soft)] text-[var(--ds-text-primary)] transition-transform",
                          isExpanded ? "rotate-180" : "",
                        )}
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.179l3.71-3.95a.75.75 0 1 1 1.08 1.04l-4.25 4.52a.75.75 0 0 1-1.08 0l-4.25-4.52a.75.75 0 0 1 .02-1.06Z" />
                        </svg>
                      </span>
                    </button>

                    {fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="shrink-0 px-3 py-2"
                        onClick={() => {
                          remove(index);
                          setExpandedIndex((current) => {
                            if (current === null) {
                              return null;
                            }

                            if (current === index) {
                              return index > 0 ? index - 1 : 0;
                            }

                            return current > index ? current - 1 : current;
                          });
                        }}
                      >
                        {t("auth.additional.remove_student")}
                      </Button>
                    ) : null}
                  </div>

                  <div id={panelId} hidden={!isExpanded} className="space-y-4 border-t border-[var(--ds-border)] px-4 py-4">
                    <FormField
                      label="auth.additional.student_name_label"
                      htmlFor={`students.${index}.studentName`}
                      error={errors.students?.[index]?.studentName?.message}
                    >
                      <Input
                        id={`students.${index}.studentName`}
                        placeholder={t("auth.additional.student_name_placeholder")}
                        {...register(`students.${index}.studentName` as const)}
                      />
                    </FormField>

                    <FormField
                      label="auth.additional.student_birth_date_label"
                      htmlFor={`students.${index}.studentBirthDate`}
                      error={errors.students?.[index]?.studentBirthDate?.message}
                    >
                      <Input
                        id={`students.${index}.studentBirthDate`}
                        type="date"
                        {...register(`students.${index}.studentBirthDate` as const)}
                      />
                    </FormField>

                    <FormField
                      label="auth.additional.current_school_label"
                      htmlFor={`students.${index}.currentSchool`}
                      error={errors.students?.[index]?.currentSchool?.message}
                    >
                      <Input
                        id={`students.${index}.currentSchool`}
                        placeholder={t("auth.additional.current_school_placeholder")}
                        {...register(`students.${index}.currentSchool` as const)}
                      />
                    </FormField>

                    <FormField
                      label="auth.additional.target_grade_label"
                      htmlFor={`students.${index}.targetGrade`}
                      error={errors.students?.[index]?.targetGrade?.message}
                    >
                      <Select id={`students.${index}.targetGrade`} defaultValue="" {...register(`students.${index}.targetGrade` as const)}>
                        <option value="" disabled>
                          {t("auth.additional.target_grade_placeholder")}
                        </option>
                        {TARGET_GRADE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {t(`auth.additional.target_grade.${option}`)}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField
                      label="auth.additional.student_notes_label"
                      htmlFor={`students.${index}.notes`}
                      error={errors.students?.[index]?.notes?.message}
                    >
                      <textarea
                        id={`students.${index}.notes`}
                        rows={3}
                        className="field-input w-full rounded-2xl px-4 py-3 text-sm"
                        placeholder={t("auth.additional.student_notes_placeholder")}
                        {...register(`students.${index}.notes` as const)}
                      />
                    </FormField>
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                append({
                  studentName: "",
                  studentBirthDate: "",
                  currentSchool: "",
                  targetGrade: "",
                  notes: "",
                });
                setExpandedIndex(fields.length);
              }}
            >
              {t("auth.additional.add_student")}
            </Button>

            <Button type="submit" className="w-full" disabled={isSubmitting || submitStudentsMutation.isPending || setupContextQuery.isLoading}>
              {isSubmitting || submitStudentsMutation.isPending ? t("auth.additional.submit_loading") : t("auth.additional.submit")}
            </Button>
          </form>

          <Link
            href={getSetupMethodHref(admissionId)}
            className="inline-flex text-sm font-semibold text-[var(--ds-primary)]"
          >
            {t("auth.additional.back_to_method")}
          </Link>
        </>
      ) : null}
    </div>
  );
}
