import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";

// Add a new comment to a complaint
export const addComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { text, complaintId } = req.body;
    const userId = (req as any).user.id;

    const comment = await prisma.comment.create({
      data: {
        text,
        complaintId: Number(complaintId),
        userId,
      },
      include: {
        user: { select: { name: true, role: true } },
      },
    });

    res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while adding comment" });
  }
};

// Get all comments for a specific complaint
export const getComments = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { complaintId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { complaintId: Number(complaintId) },
      include: {
        user: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Fetch Comments Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
