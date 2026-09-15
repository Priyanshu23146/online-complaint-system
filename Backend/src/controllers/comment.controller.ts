import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";

export const addComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { text, complaintId } = req.body;
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;

    // 🚨 FIX: verify the complaint being commented on belongs to the commenter's own org
    const complaint = await prisma.complaint.findFirst({
      where: { id: Number(complaintId), department: { organizationId } },
    });
    if (!complaint) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Complaint not found in your organization",
        });
    }

    const comment = await prisma.comment.create({
      data: { text, complaintId: complaint.id, userId },
      include: { user: { select: { name: true, role: true } } },
    });

    res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while adding comment" });
  }
};

export const getComments = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { complaintId } = req.params;
    const organizationId = req.user!.organizationId;

    // 🚨 FIX: same tenant check before returning any comments
    const complaint = await prisma.complaint.findFirst({
      where: { id: Number(complaintId), department: { organizationId } },
    });
    if (!complaint) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Complaint not found in your organization",
        });
    }

    const comments = await prisma.comment.findMany({
      where: { complaintId: complaint.id },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Fetch Comments Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
