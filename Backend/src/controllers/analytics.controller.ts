import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";
import {
  getComplaintAnalytics,
  getDepartmentStats,
  getComplaintTrendData,
} from "../services/analytics.service.js";

export const getAnalytics = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const organizationId = req.user!.organizationId;

    const complaints = await getComplaintAnalytics(organizationId);
    const departments = await getDepartmentStats(organizationId);
    const trends = await getComplaintTrendData(organizationId);

    res.json({
      success: true,
      data: {
        complaints,
        departments,
        trends,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
};

export const getDepartmentAnalytics = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { departmentId } = req.params;
    const organizationId = req.user!.organizationId;

    const complaints = await prisma.complaint.findMany({
      where: {
        departmentId: Number(departmentId),
        department: { organizationId },
      },
    });

    const stats = {
      total: complaints.length,
      pending: complaints.filter((c: any) => c.status === "Pending").length,
      inProgress: complaints.filter((c: any) => c.status === "In-Progress")
        .length,
      resolved: complaints.filter((c: any) => c.status === "Resolved").length,
      avgResolutionTime: "Pending",
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
