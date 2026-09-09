import express from "express";
import multer from "multer";
import { uploadAndParseTimetable } from "../controllers/schedule.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Memory storage use kar rahe hain taaki image direct RAM se Gemini ko jaye, disk par save na ho
const upload = multer({ storage: multer.memoryStorage() });

// 🚀 AI Parsing Route
// Frontend se key "scheduleImage" honi chahiye
router.post(
  "/upload",
  authenticateUser,
  upload.single("scheduleImage"),
  uploadAndParseTimetable,
);

export default router;
