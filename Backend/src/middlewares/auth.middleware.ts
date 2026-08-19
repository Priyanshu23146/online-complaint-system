// ==========================================
// Middleware: Token Verify Karne Ke Liye
// ==========================================
// Ye function check karega ki user ke paas valid "Digital ID Card" hai ya nahi

import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // ==========================================
  // Middleware: Token Verify Karne Ke Liye
  // ==========================================
  // Ye function check karega ki user ke paas valid "Digital ID Card" hai ya nahi
  const token = req.header("Authorization")?.split(" ")[1]; // "Bearer <token>" se token nikalna

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access Denied. No token provided." });

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    );
    (req as any).user = verified; // Token se user ID nikal kar request mein daal di
    next(); // Sab theek hai, aage badhne do
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid Token" });
  }
};
