import express from "express";
import { addComment, getComments } from "../controllers/comment.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { addCommentSchema } from "../validators/comment.validator.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", validate(addCommentSchema), addComment);
router.get("/:complaintId", getComments);

export default router;
