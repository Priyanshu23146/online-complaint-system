import { type Request, type Response } from "express";
import { parseScheduleImage } from "../services/ai.service.js";
import { prisma } from "../config/db.js";

export const uploadAndParseTimetable = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided" });
    }

    const departmentId = parseInt(req.body.departmentId);
    const managerId = (req as any).user.id; // Manager/Teacher ID from Auth Token

    if (!departmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Department ID is required" });
    }

    // 1. Send image to Gemini AI
    const parsedData = await parseScheduleImage(
      req.file.mimetype,
      req.file.buffer,
    );

    // 2. Prepare data for Prisma (Convert string times to actual Date objects if needed,
    // for now we will assume the frontend handles the exact date logic or we map it to today's date)
    // 🚀 We will refine the Date parsing logic in the next step!

    res.status(200).json({
      success: true,
      message: "Image parsed successfully",
      data: parsedData,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during timetable upload",
    });
  }
};
