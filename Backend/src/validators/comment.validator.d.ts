import { z } from "zod";
export declare const addCommentSchema: z.ZodObject<{
    text: z.ZodString;
    complaintId: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
}, z.core.$strip>;
//# sourceMappingURL=comment.validator.d.ts.map