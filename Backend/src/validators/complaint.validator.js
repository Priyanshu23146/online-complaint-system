import { z } from "zod";
export const createComplaintSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" }),
    departmentId: z.union([z.string(), z.number()]),
});
// Note: match this list to whatever status strings your frontend actually sends.
export const updateComplaintStatusSchema = z.object({
    status: z.enum(["Pending", "In Progress", "Resolved", "Rejected"]),
});
//# sourceMappingURL=complaint.validator.js.map