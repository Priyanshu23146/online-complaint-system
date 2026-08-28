import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

// 🚀 REGISTER API
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, rollNo, branch, year } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        rollNo,
        branch,
        year,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
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
        // @ts-ignore
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
}; // 👈 Login function yahan proper close ho gaya

// 🚀 FORCE CHANGE PASSWORD API (Ab ye ekdum bahar aur sahi jagah par hai)
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
