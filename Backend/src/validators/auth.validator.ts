import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  // 🚨 FIX: self-signup must now name a real organization instead of
  // silently attaching to "whatever org exists first".
  organizationCode: z
    .string()
    .min(2, {
      message:
        "Organization code is required (ask your college/hospital admin)",
    }),
  departmentId: z.number().int().positive().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// 🚨 FIX: no `email` field anymore — you can only change YOUR OWN password,
// identity comes from the authenticated token, not from the request body.
export const forceChangePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const onboardClientSchema = z.object({
  organizationName: z
    .string()
    .min(2, { message: "Organization name is required" }),
  organizationCode: z
    .string()
    .min(2, {
      message: "A short unique join-code for this organization is required",
    }),
  adminName: z.string().min(2, { message: "Admin name is required" }),
  adminEmail: z.string().email({ message: "Invalid admin email" }),
});
