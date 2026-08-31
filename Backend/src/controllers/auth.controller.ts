import crypto from "crypto";
import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

// 🚀 REGISTER API
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. 🚀 SAAS LOGIC: Check if default Organization exists, if not, create it
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: "AITD Kanpur", domain: "@aitd.edu" },
      });
    }

    // 3. Create User and link to the Organization
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT",
        organizationId: org.id, // 🚀 Naya SaaS rule
      },
    });

    res
      .status(201)
      .json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🚀 LOGIN API
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

// 🚀 FORCE CHANGE PASSWORD API
export const forceChangePassword = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { email, newPassword } = req.body;

    // 1. Naya password hash karne ke liye function
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 2. Database mein user ka password update karein aur flag ko 'false' kar dein
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        mustChangePassword: false, // 🚀 Security lock khul gaya!
      },
    });

    res.status(200).json({
      success: true,
      message:
        "Password updated successfully! You can now access the dashboard.",
    });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating password",
    });
  }
};

// 🚀 SUPER ADMIN: ONBOARD NEW CLIENT/ADMIN
export const onboardClient = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { name, email, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }

    // 1. Generate a random secure 8-character password
    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 🚀 SAAS LOGIC: Get or create organization for the admin
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: "AITD Kanpur", domain: "@aitd.edu" },
      });
    }

    // 2. Create the Admin user with the security lock ON and linked to Organization
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "DEPT_ADMIN",
        organizationId: org.id, // 🚀 Fixed SaaS linkage
        mustChangePassword: true,
      },
    });

    // 3. Send the plain password in response
    res.status(201).json({
      success: true,
      message: "Admin created successfully!",
      adminEmail: newAdmin.email,
      tempPassword: tempPassword,
    });
  } catch (error) {
    console.error("Onboarding Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during onboarding" });
  }
};
