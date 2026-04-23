import { z } from "zod";

export const additionalStudentSchema = z.object({
  studentName: z.string().trim().min(1, "validation.additional.student_name_required"),
  studentBirthDate: z.string().min(1, "validation.additional.student_birth_date_required"),
  currentSchool: z.string().trim().min(1, "validation.additional.current_school_required"),
  targetGrade: z.string().min(1, "validation.additional.target_grade_required"),
  /** Per-student target school (IIHS or IISS). Selected independently
   *  per child — a family can legitimately split kids across schools. */
  targetSchool: z.enum(["iihs", "iiss"], {
    message: "validation.additional.target_school_required",
  }),
  notes: z.string().trim().max(500, "validation.additional.student_notes_max").optional().or(z.literal("")),
});

export const additionalDetailsSchema = z.object({
  accessToken: z.string().min(1, "validation.additional.token_required"),
  students: z.array(additionalStudentSchema).min(1, "validation.additional.students_min").max(5, "validation.additional.students_max"),
});

export type AdditionalStudentFormValues = z.infer<typeof additionalStudentSchema>;
export type AdditionalDetailsFormValues = z.infer<typeof additionalDetailsSchema>;
