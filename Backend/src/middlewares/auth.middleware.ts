import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

interface TokenPayload {
  id: number;
  role: string;
  organizationId: number;
  departmentId: number | null;
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenPayload;

    // 🚨 FIX: re-check the user against the DB on every request instead of
    // blindly trusting the token's role/org for a full day. Cheap PK lookup,
    // but it means a role change or account deactivation takes effect immediately.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        organizationId: true,
        departmentId: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    req.user = {
      id: user.id,
      role: user.role,
      organizationId: user.organizationId,
      departmentId: user.departmentId,
    };

    next();
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
