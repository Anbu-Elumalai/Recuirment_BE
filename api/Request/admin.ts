import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  organizationName: z.string().min(1, "Organization name is required"),
  organizationType: z.enum(["company", "college", "school"]).refine(
    (val) => ["company", "college", "school"].includes(val),
    { message: "Organization type must be either company, college, or school" }
  ),
  numberOfStudentsOrEmployees: z.string().min(1, "Capacity is required"),
  phoneNumber: z.number().min(1000000, "Too short").max(999999999999999, "Too long"),
  country:z.string().min(1, "Country is required"),
});
export type CreateAdminInput = z.infer<typeof createAdminSchema>;

export const loginAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginAdminInput = z.infer<typeof loginAdminSchema>;

// Password reset/change schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters long"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
