import { z } from "zod";

export const MAX_PROSPECTIVE_CHILDREN = 10;

export const prospectiveChildSchema = z.object({
  age: z
    .number()
    .int("validation.eoi.age_integer")
    .min(0, "validation.eoi.age_min")
    .max(18, "validation.eoi.age_max"),
});

export const eoiSchema = z
  .object({
    parentName: z.string().min(2, "validation.eoi.parent_name_required"),
    email: z.email("validation.email.invalid"),
    whatsapp: z
      .string()
      .min(10, "validation.eoi.whatsapp_invalid")
      .regex(/^[0-9+\-\s]+$/, "validation.eoi.whatsapp_format"),
    locationSuburb: z.string().min(2, "validation.eoi.location_required"),
    occupation: z.string().min(2, "validation.eoi.occupation_required"),
    hasExistingStudents: z.enum(["yes", "no"], {
      message: "validation.eoi.has_existing_students_required",
    }),
    existingChildrenCount: z
      .number()
      .int("validation.eoi.children_count_integer")
      .min(1, "validation.eoi.children_count_min")
      .optional(),
    /**
     * How many children the family intends to enrol — independent of
     * existingChildrenCount (which counts kids already at the school).
     */
    prospectiveChildrenCount: z
      .number()
      .int("validation.eoi.prospective_count_integer")
      .min(1, "validation.eoi.prospective_count_min")
      .max(MAX_PROSPECTIVE_CHILDREN, "validation.eoi.prospective_count_max"),
    /**
     * One row per child; length must match prospectiveChildrenCount.
     * Each row is `{age: 0-18}` — age in years at the moment of
     * submission. Marketing signal.
     */
    prospectiveChildren: z
      .array(prospectiveChildSchema)
      .min(1, "validation.eoi.prospective_children_required")
      .max(MAX_PROSPECTIVE_CHILDREN, "validation.eoi.prospective_children_max"),
    referralCode: z.string().optional(),
    heardFrom: z.string().min(2, "validation.eoi.heard_from_required"),
    school: z.enum(["iihs", "iiss"], {
      message: "validation.eoi.school_required",
    }),
  })
  .superRefine((value, context) => {
    if (value.hasExistingStudents === "yes" && !value.existingChildrenCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["existingChildrenCount"],
        message: "validation.eoi.existing_children_count_required",
      });
    }
    if (value.prospectiveChildren.length !== value.prospectiveChildrenCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prospectiveChildren"],
        message: "validation.eoi.prospective_children_count_mismatch",
      });
    }
  });

export type EOIFormValues = z.infer<typeof eoiSchema>;
export type ProspectiveChildFormValue = z.infer<typeof prospectiveChildSchema>;
