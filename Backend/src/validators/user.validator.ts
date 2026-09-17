import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  role: z.enum(["DEPT_ADMIN", "STAFF", "MEMBER"], {
    message: "Role must be DEPT_ADMIN, STAFF, or MEMBER",
  }),
  departmentId: z.number().int().positive().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
