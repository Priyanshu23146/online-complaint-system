import { z } from "zod";
export declare const createNoticeSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    visibility: z.ZodEnum<{
        ORG_PUBLIC: "ORG_PUBLIC";
        DEPT_PUBLIC: "DEPT_PUBLIC";
        STAFF_ONLY: "STAFF_ONLY";
        DEPT_ADMIN_ONLY: "DEPT_ADMIN_ONLY";
    }>;
    departmentId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateNoticeSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodEnum<{
        ORG_PUBLIC: "ORG_PUBLIC";
        DEPT_PUBLIC: "DEPT_PUBLIC";
        STAFF_ONLY: "STAFF_ONLY";
        DEPT_ADMIN_ONLY: "DEPT_ADMIN_ONLY";
    }>>;
}, z.core.$strip>;
export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
//# sourceMappingURL=notice.validator.d.ts.map