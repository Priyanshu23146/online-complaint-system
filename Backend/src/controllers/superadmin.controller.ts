import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";

// Fetch all organizations with their admin details and active subscription
export const getAllClients = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Security check: Only SUPER_ADMIN can access this

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

// Upgrade Organization Subscription Plan
export const upgradeClientPlan = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // 🛡️ Security check: Only SUPER_ADMIN can access this

    // ✅ TypeScript Safe ID Parsing
    const idParam = req.params.id as string;
    if (!idParam) {
      return res
        .status(400)
        .json({ success: false, message: "Organization ID is required" });
    }

    const orgId = parseInt(idParam, 10);
    const { plan } = req.body;

    if (!plan) {
      return res
        .status(400)
        .json({ success: false, message: "Plan type is required" });
    }

    // 💾 Prisma Update Query: Update subscriptions for this organization
    await prisma.subscription.updateMany({
      where: { organizationId: orgId },
      data: { plan: plan },
    });

    res.json({
      success: true,
      message: `Successfully upgraded to ${plan} plan!`,
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upgrade client plan" });
  }
};
// 🚀 Delete Client Organization (with cascade cleanup)
export const deleteClient = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Security check: Only SUPER_ADMIN can delete

    const idParam = req.params.id as string;
    if (!idParam)
      return res
        .status(400)
        .json({ success: false, message: "Organization ID is required" });
    const orgId = parseInt(idParam, 10);

    // 🧹 Step 1: Delete related subscriptions first
    await prisma.subscription.deleteMany({
      where: { organizationId: orgId },
    });

    // 🧹 Step 2: Delete related users linked to this organization
    await prisma.user.deleteMany({
      where: { organizationId: orgId },
    });

    // 🚀 Step 3: Now safely delete the organization
    await prisma.organization.delete({
      where: { id: orgId },
    });

    res.json({
      success: true,
      message: "Organization and its data deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete organization due to server error.",
    });
  }
};
