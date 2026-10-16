import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";
import {
  sendComplaintNotification,
  sendStatusUpdateEmail,
} from "../services/email.service.js";

// 1. Create Complaint (UNCHANGED)
export const createComplaint = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { title, description, departmentId } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;

    const department = await prisma.department.findFirst({
      where: { id: Number(departmentId), organizationId },
    });
    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Invalid department for your organization",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const newComplaint = await prisma.complaint.create({
      data: { title, description, userId, departmentId: department.id },
    });

    if (user?.email) {
      await sendComplaintNotification(user.email, title, newComplaint.id);
    }

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

// 2. Get All Complaints with Search & Filters — 🚀 ENHANCED VERSION
/**
 * SEARCH & FILTERS IMPLEMENTATION
 *
 * Supported Query Parameters:
 * - page (default: 1) — pagination page number
 * - limit (default: 20) — items per page
 * - search — full-text search on title + description
 * - status — filter by status (Pending, In-Progress, Resolved)
 * - departmentId — filter by department
 * - startDate — filter complaints from this date (YYYY-MM-DD)
 * - endDate — filter complaints until this date (YYYY-MM-DD)
 * - sortBy — sort option (newest, oldest, most-upvotes, least-upvotes)
 *
 * Examples:
 * GET /api/complaints
 * GET /api/complaints?search=database
 * GET /api/complaints?status=Pending&departmentId=1
 * GET /api/complaints?startDate=2024-09-01&endDate=2024-09-30
 * GET /api/complaints?search=canteen&status=Resolved&sortBy=newest&page=1&limit=20
 */
export const getComplaints = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { role, departmentId, organizationId, id: userId } = req.user!;

    // ==========================================
    // STEP 1: Parse Query Parameters
    // ==========================================
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string)?.trim();
    const status = req.query.status as string;
    const queryDepartmentId = req.query.departmentId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const sortBy = (req.query.sortBy as string) || "newest";
    const skip = (page - 1) * limit;

    // ==========================================
    // STEP 2: Build WHERE Clause (Complex)
    // ==========================================
    const whereCondition: any = {
      // 🔒 SECURITY: Always scope to user's organization
      department: { organizationId },
    };

    // FILTER 1: Status Filter
    if (status && status.trim()) {
      whereCondition.status = status;
    }

    // FILTER 2: Department Filter
    // Admin can see all depts, DEPT_ADMIN only their dept
    if (queryDepartmentId) {
      whereCondition.departmentId = Number(queryDepartmentId);
    } else if (role === "DEPT_ADMIN") {
      // DEPT_ADMIN automatically filtered to their department
      whereCondition.departmentId = departmentId;
    }

    // FILTER 3: Role-Based Access Control
    if (role === "MEMBER") {
      // Members only see their own complaints
      whereCondition.userId = userId;
    }

    // FILTER 4: Full-Text Search
    // Search in title OR description
    if (search && search.length > 0) {
      whereCondition.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive", // Case-insensitive search
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // FILTER 5: Date Range Filter
    const dateFilter: any = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        dateFilter.gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      // End of day: set time to 23:59:59
      end.setHours(23, 59, 59, 999);
      if (!isNaN(end.getTime())) {
        dateFilter.lte = end;
      }
    }
    if (Object.keys(dateFilter).length > 0) {
      whereCondition.createdAt = dateFilter;
    }

    // ==========================================
    // STEP 3: Determine Sort Order
    // ==========================================
    let orderBy: any = { createdAt: "desc" }; // Default: newest first

    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "most-upvotes") {
      orderBy = { upvotes: "desc" };
    } else if (sortBy === "least-upvotes") {
      orderBy = { upvotes: "asc" };
    }
    // else: sortBy === "newest" → default already set

    // ==========================================
    // STEP 4: Execute Query
    // ==========================================
    const complaints = await prisma.complaint.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true, role: true } },
        department: { select: { name: true, id: true } },
      },
      orderBy,
    });

    // Get total count for pagination metadata
    const totalComplaints = await prisma.complaint.count({
      where: whereCondition,
    });

    // ==========================================
    // STEP 5: Return Response
    // ==========================================
    res.status(200).json({
      success: true,
      metadata: {
        totalComplaints,
        currentPage: page,
        totalPages: Math.ceil(totalComplaints / limit),
        itemsPerPage: limit,
        appliedFilters: {
          search: search || null,
          status: status || null,
          departmentId: queryDepartmentId ? Number(queryDepartmentId) : null,
          dateRange:
            startDate || endDate
              ? { startDate: startDate || null, endDate: endDate || null }
              : null,
          sortBy,
        },
      },
      complaints,
    });
  } catch (error) {
    console.error("Fetch Complaints Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Update Status (UNCHANGED)
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

    const complaint = await prisma.complaint.findFirst({
      where: { id: complaintId, department: { organizationId } },
      include: { user: { select: { email: true } } },
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

    if (complaint.status !== status) {
      await sendStatusUpdateEmail(
        complaint.user.email,
        complaint.title,
        status,
      );
    }

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

// 4. Delete Complaint (UNCHANGED)
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
