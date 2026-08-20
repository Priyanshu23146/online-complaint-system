import { z } from "zod";
// Register validation rules
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
});
// Login validation rules
export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});
//# sourceMappingURL=auth.validator.js.map