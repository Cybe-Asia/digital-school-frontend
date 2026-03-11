import { z } from "zod";

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
  });

export type EOIFormValues = z.infer<typeof eoiSchema>;
