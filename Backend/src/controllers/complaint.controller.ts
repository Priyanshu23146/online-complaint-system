import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";

// 1. Create Complaint
export const createComplaint = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { title, description } = req.body;
    const userId = (req as any).user.id;

    const newComplaint = await prisma.complaint.create({
      data: { title, description, userId },
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

// 2. Get All Complaints
// -----------------------------------------------------
// GET ALL COMPLAINTS (With Pagination & Filtering)
// -----------------------------------------------------
export const getComplaints = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // 1. URL se queries nikalna (e.g., ?page=1&limit=5&status=Pending)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    // 2. Prisma ke liye skip calculate karna (Data ko tukdon mein baatna)
    const skip = (page - 1) * limit;

    // 3. Filter condition banana (agar frontend ne status bheja hai tabhi lagana)
    const whereCondition = status ? { status: status } : {};

    // 4. Database se limited data aur total count lana
    const complaints = await prisma.complaint.findMany({
      where: whereCondition,
      skip: skip,
      take: limit, // Sirf limit jitna data hi uthayega
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Pata lagana ki database mein total kitni complaints hain
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
// 3. Update Status (Admin)
export const updateComplaintStatus = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const complaintId = parseInt(req.params.id as string, 10);
    const { status } = req.body;
    const userId = (req as any).user.id;

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (currentUser?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Sirf Admin isey update kar sakte hain.",
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

// 4. Delete Complaint (Admin)
export const deleteComplaint = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const complaintId = parseInt(req.params.id as string, 10);
    const userId = (req as any).user.id;

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (currentUser?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied! Sirf Admin hi complaints delete kar sakte hain.",
      });
    }

    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });
    if (!existingComplaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found!" });
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
