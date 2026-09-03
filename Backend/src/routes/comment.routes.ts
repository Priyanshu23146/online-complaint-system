import express from "express";
import { addComment, getComments } from "../controllers/comment.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateUser, addComment);
router.get("/:complaintId", authenticateUser, getComments);

export default router;
