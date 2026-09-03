import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";

// Fetch all organizations with their admin details and active subscription
export const getAllClients = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Security check: Only SUPER_ADMIN can access this
    if ((req as any).user.role !== "SUPER_ADMIN") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    const organizations = await prisma.organization.findMany({
      include: {
        users: {
          where: { role: "ORG_ADMIN" },
          select: { name: true, email: true },
        },
        subscriptions: {
          orderBy: { id: "desc" },
          take: 1, // Get the latest billing plan
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({ success: true, organizations });
  } catch (error) {
    console.error("Fetch Clients Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch clients" });
  }
};
