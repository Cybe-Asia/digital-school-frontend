import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("validation.email.invalid"),
  password: z.string().min(1, "validation.login.password_required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
