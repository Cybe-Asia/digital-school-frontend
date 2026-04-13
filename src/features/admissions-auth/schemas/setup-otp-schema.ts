import { z } from "zod";

export const setupOtpSchema = z.object({
  token: z.string().min(1, "validation.setup.token_required"),
  otp: z
    .string()
    .min(1, "validation.setup.otp_required")
    .regex(/^\d{4}$/, "validation.setup.otp_format"),
});

export type SetupOtpFormValues = z.infer<typeof setupOtpSchema>;
