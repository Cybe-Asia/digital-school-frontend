import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.email("validation.email.invalid"),
});

export type RequestPasswordResetFormValues = z.infer<typeof requestPasswordResetSchema>;
