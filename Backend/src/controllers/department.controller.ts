import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// 🚀 CREATE A NEW DEPARTMENT (Admin Only)
export const createDepartment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Department name is required" });
    }

    const newDept = await prisma.department.create({
      data: { name },
    });

    res.status(201).json({
      success: true,
      message: "Department created",
      department: newDept,
    });
  } catch (error) {
    console.error("Create Dept Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating department",
    });
  }
};

// 🚀 GET ALL DEPARTMENTS (For Dropdown)
export const getDepartments = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const departments = await prisma.department.findMany();
    res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error("Fetch Depts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching departments",
    });
  }
};
// 🚀 DELETE A DEPARTMENT (Admin Only)
export const deleteDepartment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    // Prisma se department delete karo
    await prisma.department.delete({
      where: { id: Number(id) },
    });

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
// 🚀 ASSIGN ADMIN TO A DEPARTMENT
export const assignAdmin = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const departmentId = parseInt(req.params.id as string);
    const { name, email } = req.body;

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists!",
      });
    }

    // 1. Generate a random temporary password
    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 2. Create the DEPT_ADMIN with security lock
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DEPT_ADMIN",
        departmentId: departmentId, // 🚀 Department se link kar diya!
        mustChangePassword: true, // Security Lock ON
      },
    });

    res.status(201).json({
      success: true,
      message: "Department Admin created successfully!",
      adminEmail: newAdmin.email,
      tempPassword: tempPassword,
    });
  } catch (error) {
    console.error("Assign Admin Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while assigning admin" });
  }
};
