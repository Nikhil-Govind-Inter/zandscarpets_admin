import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});
export type EmailFormData = z.infer<typeof emailSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must contain only digits"),
});
export type OtpFormData = z.infer<typeof otpSchema>;

// Mirrors the backend's password complexity rule (server/modules/admin/http/request/auth/AuthRequest.js)
// so a client-side rejection matches what the API would reject anyway.
const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(
        passwordComplexity,
        "Password must contain lowercase, uppercase, number, and special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
