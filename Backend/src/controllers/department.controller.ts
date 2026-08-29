import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";

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
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching departments",
      });
  }
};
