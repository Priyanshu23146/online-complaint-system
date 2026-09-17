import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<{
        DEPT_ADMIN: "DEPT_ADMIN";
        STAFF: "STAFF";
        MEMBER: "MEMBER";
    }>;
    departmentId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
//# sourceMappingURL=user.validator.d.ts.map