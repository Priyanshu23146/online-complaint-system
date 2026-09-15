import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

// 🚀 CREATE DEPARTMENT — scoped to caller's own organization
export const createDepartment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { name } = req.body;
    const organizationId = req.user!.organizationId;

    const newDept = await prisma.department.create({
      data: { name, organizationId },
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Department created",
        department: newDept,
      });
  } catch (error) {
    console.error("Create Dept Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while creating department",
      });
  }
};

// 🚀 GET ALL DEPARTMENTS — 🚨 FIX: was returning EVERY org's departments before
export const getDepartments = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const organizationId = req.user!.organizationId;

    const departments = await prisma.department.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error("Fetch Depts Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching departments",
      });
  }
};

// 🚀 DELETE DEPARTMENT — scoped to own org
export const deleteDepartment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;

    // 🚨 FIX: verify ownership before deleting anything
    const dept = await prisma.department.findFirst({
      where: { id: Number(id), organizationId },
    });
    if (!dept) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Department not found in your organization",
        });
    }

    await prisma.department.delete({ where: { id: Number(id) } });
    res
      .status(200)
      .json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("Delete Dept Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete department (Maybe it has active complaints?)",
    });
  }
};

// 🚀 ASSIGN DEPT_ADMIN — scoped to own org
export const assignAdmin = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const departmentId = parseInt(req.params.id as string);
    const { name, email } = req.body;
    const organizationId = req.user!.organizationId;

    // 🚨 FIX: confirm the department belongs to the caller's own organization
    const department = await prisma.department.findFirst({
      where: { id: departmentId, organizationId },
    });
    if (!department) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Department not found in your organization",
        });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User with this email already exists!",
        });
    }

    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    // 🚨 CRITICAL FIX: `organizationId` was missing entirely before — since it's
    // a required field on User, this call would actually have crashed at runtime.
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DEPT_ADMIN",
        organizationId: department.organizationId,
        departmentId: department.id,
        mustChangePassword: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Department Admin created successfully!",
      adminEmail: newAdmin.email,
      tempPassword,
    });
  } catch (error) {
    console.error("Assign Admin Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while assigning admin" });
  }
};
