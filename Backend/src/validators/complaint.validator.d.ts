import { z } from "zod";
export declare const createComplaintSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    departmentId: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
}, z.core.$strip>;
export declare const updateComplaintStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        Pending: "Pending";
        "In Progress": "In Progress";
        Resolved: "Resolved";
        Rejected: "Rejected";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=complaint.validator.d.ts.map