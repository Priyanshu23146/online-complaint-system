import { prisma } from "../config/db.js";

export const getComplaintAnalytics = async (organizationId: number) => {
  const complaints = await prisma.complaint.findMany({
    where: { department: { organizationId } },
  });

  const total = complaints.length;
  const pending = complaints.filter((c: any) => c.status === "Pending").length;
  const inProgress = complaints.filter(
    (c: any) => c.status === "In-Progress",
  ).length;
  const resolved = complaints.filter(
    (c: any) => c.status === "Resolved",
  ).length;

  return {
    total,
    pending,
    inProgress,
    resolved,
    resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0,
  };
};

export const getDepartmentStats = async (organizationId: number) => {
  const departments = await prisma.department.findMany({
    where: { organizationId },
    include: { complaints: true },
  });

  return departments.map((dept) => ({
    name: dept.name,
    totalComplaints: dept.complaints.length,
    resolved: dept.complaints.filter((c: any) => c.status === "Resolved")
      .length,
    pending: dept.complaints.filter((c: any) => c.status === "Pending").length,
  }));
};

export const getComplaintTrendData = async (organizationId: number) => {
  const complaints = await prisma.complaint.findMany({
    where: { department: { organizationId } },
    orderBy: { createdAt: "asc" },
  });

  const dailyData: Record<string, number> = {};

  complaints.forEach((c: any) => {
    const date = c.createdAt.toISOString().split("T")[0];
    dailyData[date] = (dailyData[date] || 0) + 1;
  });

  return Object.entries(dailyData).map(([date, count]) => ({ date, count }));
};
