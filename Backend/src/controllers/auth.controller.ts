import crypto from "crypto";
import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const SALT_ROUNDS = 12; // 🚨 FIX: was 10

// 🚀 REGISTER API (public self-signup — always creates a STUDENT)
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, organizationCode, departmentId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    // 🚨 FIX: organization is resolved from an explicit join-code (Organization.domain),
    // never "the first org in the DB". Every signup now belongs to a REAL, correct tenant.
    const org = await prisma.organization.findUnique({
      where: { domain: organizationCode },
    });
    if (!org) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid organization code. Check with your college/hospital admin.",
      });
    }

    // If a department is given, it must belong to THIS organization —
    // stops a user from claiming a departmentId that belongs to another tenant.
    if (departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: departmentId, organizationId: org.id },
      });
      if (!dept) {
        return res.status(400).json({
          success: false,
          message: "That department does not belong to this organization.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 🚨 FIX: role is NEVER taken from client input anymore. Previously
    // `role: role || "STUDENT"` let anyone self-register as SUPER_ADMIN by
    // just adding `"role": "SUPER_ADMIN"` to the request body.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        organizationId: org.id,
        departmentId: departmentId ?? null,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: { id: user.id, name: user.name, email: user.email },
    });
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

    // 🚨 FIX: organizationId + departmentId now embedded in the token.
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
      },
      process.env.JWT_SECRET, // 🚨 FIX: no more "supersecret" fallback anywhere
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
        organizationId: user.organizationId,
        departmentId: user.departmentId,
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

// 🚀 FORCE CHANGE PASSWORD API — must be logged in, can only change YOUR OWN password
export const forceChangePassword = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // 🚨 CRITICAL FIX: previously took `email` straight from req.body with
    // ZERO auth check on this route — anyone could reset ANY account's password
    // without knowing the old one. Now identity comes only from the verified token.
    const userId = req.user!.id;
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, mustChangePassword: false },
    });

    res.status(200).json({
      success: true,
      message:
        "Password updated successfully! You can now access the dashboard.",
    });
  } catch (error) {
    console.error("Password Update Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while updating password",
      });
  }
};

// 🚀 SUPER ADMIN: ONBOARD NEW CLIENT ORGANIZATION & ADMIN
export const onboardClient = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { organizationName, organizationCode, adminName, adminEmail } =
      req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Admin email already exists!" });
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { domain: organizationCode },
    });
    if (existingOrg) {
      return res
        .status(400)
        .json({ success: false, message: "Organization code already taken." });
    }

    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    const newOrg = await prisma.organization.create({
      data: { name: organizationName, domain: organizationCode },
    });

    const newAdmin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ORG_ADMIN",
        organizationId: newOrg.id,
        mustChangePassword: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Client created successfully!",
      organizationCode: newOrg.domain,
      adminEmail: newAdmin.email,
      tempPassword,
    });
  } catch (error) {
    console.error("Onboarding Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during onboarding" });
  }
};
