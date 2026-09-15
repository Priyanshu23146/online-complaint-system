import { z } from "zod";

export const addCommentSchema = z.object({
  text: z.string().min(1, { message: "Comment cannot be empty" }),
  complaintId: z.union([z.string(), z.number()]),
});
