import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";

// 1. Create Complaint
export const createComplaint = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { title, description, departmentId } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;

    // 🚨 FIX: department must belong to the SAME org as the person filing the complaint
    const department = await prisma.department.findFirst({
      where: { id: Number(departmentId), organizationId },
    });
    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Invalid department for your organization",
      });
    }

    const newComplaint = await prisma.complaint.create({
      data: { title, description, userId, departmentId: department.id },
    });

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    console.error("Complaint Creation Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. Get All Complaints — 🚨 CRITICAL FIX: was cross-tenant before, no org filter at all
export const getComplaints = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { role, departmentId, organizationId, id: userId } = req.user!;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    // Every query is scoped through department.organizationId — Org A can
    // never see Org B's complaints, regardless of role.
    const whereCondition: any = { department: { organizationId } };
    if (status) whereCondition.status = status;

    if (role === "DEPT_ADMIN") {
      whereCondition.departmentId = departmentId;
    }
    if (role === "MEMBER") {
      whereCondition.userId = userId; // members only see their own complaints
    }

    const complaints = await prisma.complaint.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totalComplaints = await prisma.complaint.count({
      where: whereCondition,
    });

    res.status(200).json({
      success: true,
      metadata: {
        totalComplaints,
        currentPage: page,
        totalPages: Math.ceil(totalComplaints / limit),
      },
      complaints,
    });
  } catch (error) {
    console.error("Fetch Complaints Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Update Status
export const updateComplaintStatus = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const complaintId = parseInt(req.params.id as string, 10);
    const { status } = req.body;
    const { role, departmentId, organizationId } = req.user!;

    if (role === "MEMBER") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Sirf Admin isey update kar sakte hain.",
      });
    }

    // 🚨 CRITICAL FIX: previously fetched by ID alone — any admin from ANY
    // org could update ANY complaint anywhere. Now tenant + dept scoped.
    const complaint = await prisma.complaint.findFirst({
      where: { id: complaintId, department: { organizationId } },
    });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found in your organization",
      });
    }
    if (role === "DEPT_ADMIN" && complaint.departmentId !== departmentId) {
      return res.status(403).json({
        success: false,
        message: "You can only update complaints in your own department",
      });
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully!",
      updatedComplaint,
    });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Delete Complaint
export const deleteComplaint = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const complaintId = parseInt(req.params.id as string, 10);
    const { role, departmentId, organizationId } = req.user!;

    if (role === "MEMBER") {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied! Sirf Admin hi complaints delete kar sakte hain.",
      });
    }

    // 🚨 CRITICAL FIX: same tenant + dept scoping as update above
    const complaint = await prisma.complaint.findFirst({
      where: { id: complaintId, department: { organizationId } },
    });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found in your organization",
      });
    }
    if (role === "DEPT_ADMIN" && complaint.departmentId !== departmentId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete complaints in your own department",
      });
    }

    await prisma.complaint.delete({ where: { id: complaintId } });
    res
      .status(200)
      .json({ success: true, message: "Complaint deleted successfully!" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
