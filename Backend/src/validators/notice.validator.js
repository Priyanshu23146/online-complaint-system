import { z } from "zod";
export const createNoticeSchema = z.object({
    title: z.string().min(3, {
        message: "Title must be at least 3 characters",
    }),
    content: z.string().min(5, {
        message: "Content must be at least 5 characters",
    }),
    visibility: z.enum(["ORG_PUBLIC", "DEPT_PUBLIC", "STAFF_ONLY", "DEPT_ADMIN_ONLY"], {
        message: "Visibility must be one of: ORG_PUBLIC, DEPT_PUBLIC, STAFF_ONLY, DEPT_ADMIN_ONLY",
    }),
    departmentId: z.number().int().positive().optional(),
});
export const updateNoticeSchema = z.object({
    title: z.string().min(3).optional(),
    content: z.string().min(5).optional(),
    visibility: z
        .enum(["ORG_PUBLIC", "DEPT_PUBLIC", "STAFF_ONLY", "DEPT_ADMIN_ONLY"])
        .optional(),
});
//# sourceMappingURL=notice.validator.js.map