import complaintRoutes from "./routes/complaint.routes.js";
import "dotenv/config"; // Load environment variables from .env file
import express, { type Request, type Response } from "express";
import authRoutes from "./routes/auth.routes.js"; // Ye line add karni hai
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- Naya Prisma Adapter Setup ---
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Aapke .env file se database connection string laana
const connectionString = process.env.DATABASE_URL;

// Adapter aur Prisma ko link karna
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
// ---------------------------------

const app = express();
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_complaint_key_2026";

const authenticateUser = (req: Request, res: Response, next: () => void) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    (req as any).user = verified;
    next();
  } catch {
    return res.status(400).json({ success: false, message: "Invalid Token" });
  }
};

// Authentication wale saare requests ab is route par jayenge
app.use("/api/auth", authRoutes);

app.use("/api/complaints", complaintRoutes);
app.listen(PORT, () => {
  console.log(`Server is secured and running on http://localhost:${PORT}`);
});
