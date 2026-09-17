import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/db.js";
import { canCreateRole } from "../constants/roles.js";

const Role = {
  ORG_ADMIN: "ORG_ADMIN",
  DEPT_ADMIN: "DEPT_ADMIN",
} as const;

const SALT_ROUNDS = 12;

/**
 * 🚀 CREATE USER
 *
 * Single endpoint jo hierarchy ko follow karta hai
 *
 * 🔐 Privacy Rules:
 * 1. Actor sirf apne se neeche wale role create kar sakta hai
 * 2. departmentId token se aaye, body se nahi
 * 3. Temp password generate hota hai, mustChangePassword = true
 */
export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      email,
      role: targetRole,
      departmentId: bodyDeptId,
    } = req.body;
    const {
      role: actorRole,
      organizationId,
      departmentId: actorDeptId,
    } = req.user!;

    // 🔐 Rule 1: Hierarchy enforcement
    if (!canCreateRole(actorRole as any, targetRole as any)) {
      return res.status(403).json({
        success: false,
        message: `A ${actorRole} cannot create a ${targetRole}.`,
      });
    }

    // Check karo ki email already exist nahi karta
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // 🔐 Rule 2: Department resolution
    let resolvedDeptId: number | null;

    if (actorRole === Role.ORG_ADMIN) {
      // ORG_ADMIN choose kar sakta hai
      if (!bodyDeptId) {
        return res.status(400).json({
          success: false,
          message: "departmentId is required",
        });
      }

      const dept = await prisma.department.findFirst({
        where: { id: bodyDeptId, organizationId },
      });
      if (!dept) {
        return res.status(400).json({
          success: false,
          message: "That department does not belong to your organization.",
        });
      }
      resolvedDeptId = dept.id;
    } else if (actorRole === Role.DEPT_ADMIN) {
      // DEPT_ADMIN sirf apne dept mein create kar sakta hai
      if (actorDeptId === null) {
        return res.status(400).json({
          success: false,
          message: "You are not assigned to a department. Contact your admin.",
        });
      }
      resolvedDeptId = actorDeptId;
    } else {
      // STAFF aur MEMBER create nahi kar sakte
      return res.status(403).json({
        success: false,
        message: "Your role does not have permission to create users.",
      });
    }

    // 🚀 Rule 3: Temp password generate karo
    const tempPassword = crypto.randomBytes(4).toString("hex"); // e.g., "a1b2c3d4"
    const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: targetRole as any,
        organizationId,
        departmentId: resolvedDeptId,
        mustChangePassword: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `${targetRole} created successfully! Share the temporary password.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        departmentId: newUser.departmentId,
      },
      tempPassword, // Frontend ko bhi bhej sakte ho taakin copy kar sake
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating user",
    });
  }
};

/**
 * 🚀 LIST USERS
 *
 * 🔐 Scoped list:
 * - ORG_ADMIN — poore org ke users
 * - DEPT_ADMIN — sirf apne dept ke users
 */
export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { role, organizationId, departmentId } = req.user!;

    const where: any = { organizationId };

    if (role === Role.DEPT_ADMIN) {
      where.departmentId = departmentId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
