import { type Request, type Response } from "express";
import { parseScheduleImage } from "../services/ai.service.js";
import { prisma } from "../config/db.js";

// Helper: "10:00 AM" style string ko aaj ki date ke Date object mein convert karta hai.
// Note: recurring day-of-week scheduling Phase 3 (academic engine) mein proper tarike se aayega.
function timeStringToDate(timeStr: string): Date {
  const [time, meridiem] = timeStr.trim().split(" ");
  const parts = (time ?? "").split(":").map(Number);
  let hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  if (meridiem?.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (meridiem?.toUpperCase() === "AM" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

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
    const managerId = req.user!.id;
    const organizationId = req.user!.organizationId;

    if (!departmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Department ID is required" });
    }

    // 🚨 FIX: verify department belongs to the uploader's own organization
    const department = await prisma.department.findFirst({
      where: { id: departmentId, organizationId },
    });
    if (!department) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid department for your organization",
        });
    }

    const parsedData = await parseScheduleImage(
      req.file.mimetype,
      req.file.buffer,
    );

    // 🚨 FIX: previously the parsed result was returned to the client and
    // NEVER saved anywhere. Now every parsed row becomes a real Schedule row.
    const createdSchedules = await Promise.all(
      parsedData.map(
        (item: { title: string; startTime: string; endTime: string }) =>
          prisma.schedule.create({
            data: {
              title: item.title,
              startTime: timeStringToDate(item.startTime),
              endTime: timeStringToDate(item.endTime),
              departmentId: department.id,
              managerId,
            },
          }),
      ),
    );

    res.status(200).json({
      success: true,
      message: `Timetable parsed and saved: ${createdSchedules.length} sessions created`,
      schedules: createdSchedules,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error during timetable upload",
      });
  }
};

// 🚀 NEW: list schedules — needed now that parsing actually persists data
export const getSchedules = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const organizationId = req.user!.organizationId;
    const departmentId = req.query.departmentId
      ? Number(req.query.departmentId)
      : req.user!.departmentId;

    const schedules = await prisma.schedule.findMany({
      where: {
        department: { organizationId },
        ...(departmentId ? { departmentId } : {}),
      },
      include: { manager: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    });

    res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error("Fetch Schedules Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching schedules",
      });
  }
};
