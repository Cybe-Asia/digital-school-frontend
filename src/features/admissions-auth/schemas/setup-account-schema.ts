import { z } from "zod";

export const setupAccountSchema = z
  .object({
    token: z.string().min(1, "validation.setup.token_required"),
    password: z.string().min(8, "validation.setup.password_min"),
    confirmPassword: z.string().min(1, "validation.setup.confirm_password_required"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "validation.setup.password_mismatch",
    path: ["confirmPassword"],
  });

export type SetupAccountFormValues = z.infer<typeof setupAccountSchema>;
