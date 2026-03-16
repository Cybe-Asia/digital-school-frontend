import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Parent or guardian name is required."),
    email: z.email("Enter a valid email address."),
    whatsapp: z
      .string()
      .min(10, "Enter a valid WhatsApp number.")
      .regex(/^[0-9+\-\s]+$/, "WhatsApp number can contain only numbers, spaces, +, and -."),
    school: z.enum(["iihs", "iiss"], {
      message: "Select the school campus for this admission.",
    }),
    password: z.string().min(8, "Password must contain at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
