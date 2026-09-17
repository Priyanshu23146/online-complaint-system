import { z } from "zod";
export const createDepartmentSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Department name must be at least 2 characters" }),
});
export const assignAdminSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
});
//# sourceMappingURL=department.validator.js.map