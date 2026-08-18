// import express from "express";
// import type { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const app = express();
// const prisma = new PrismaClient();
// app.use(express.json());

// const PORT = 5000;
// const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
import "dotenv/config"; // Load environment variables from .env file
import express, { type Request, type Response } from "express";
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

// ... (Niche aapke Register aur Login APIs ka code same rahega) ...

// ==========================================
// API 1: USER REGISTRATION (Sign Up)
// ==========================================
app.post(
  "/api/auth/register",
  async (req: Request, res: Response): Promise<any> => {
    try {
      // 1. Destructure data from the request body
      const { email, name, password } = req.body;

      // 2. Check if user already exists in the database
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already registered." });
      }

      // 3. Hash (Encrypt) the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Save the new user to PostgreSQL
      const newUser = await prisma.user.create({
        data: {
          email: email,
          name: name,
          password: hashedPassword, // Saving the encrypted password, not the real one!
        },
      });

      res
        .status(201)
        .json({ success: true, message: "User registered successfully!" });
    } catch (error) {
      console.error("Registration Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// ==========================================
// API 2: USER LOGIN (Sign In)
// ==========================================
app.post(
  "/api/auth/login",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password } = req.body;

      // 1. Find the user by email
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password." });
      }

      // 2. Compare the typed password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password." });
      }

      // 3. Generate a JWT Token (Digital ID Card)
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

      res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// ==========================================
// Middleware: Token Verify Karne Ke Liye
// ==========================================
// Ye function check karega ki user ke paas valid "Digital ID Card" hai ya nahi
const authenticateUser = (req: Request, res: Response, next: any) => {
  const token = req.header("Authorization")?.split(" ")[1]; // "Bearer <token>" se token nikalna

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access Denied. No token provided." });

  try {
    const verified = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string,
    );
    (req as any).user = verified; // Token se user ID nikal kar request mein daal di
    next(); // Sab theek hai, aage badhne do
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid Token" });
  }
};

// ==========================================
// API 3: CREATE A COMPLAINT
// ==========================================
app.post(
  "/api/complaints",
  authenticateUser,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { title, description } = req.body;
      const userId = (req as any).user.id; // Middleware se aayi hui ID

      const newComplaint = await prisma.complaint.create({
        data: {
          title: title,
          description: description,
          userId: userId, // Jis user ne token bheja, usi ke naam par complaint save hogi
        },
      });

      res.status(201).json({
        success: true,
        message: "Complaint registered successfully",
        complaint: newComplaint,
      });
    } catch (error) {
      console.error("Complaint Creation Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

// ==========================================
// API 4: GET ALL COMPLAINTS (For Dashboard)
// ==========================================
app.get(
  "/api/complaints",
  authenticateUser,
  async (req: Request, res: Response): Promise<any> => {
    try {
      // Database se saari complaints nikalo, aur sath mein user ka naam bhi le aao
      const complaints = await prisma.complaint.findMany({
        include: {
          user: {
            select: { name: true, email: true }, // Relation ka fayda!
          },
        },
        orderBy: { createdAt: "desc" }, // Nayi complaints sabse upar
      });

      res.status(200).json({ success: true, complaints });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

// ==========================================
// API 5: UPDATE COMPLAINT STATUS (Only for Admins)
// ==========================================
app.put(
  "/api/complaints/:id/status",
  authenticateUser,
  async (req: Request, res: Response): Promise<any> => {
    try {
      // KAAM 1: URL se Complaint ki ID aur Body se naya Status nikalna
      const complaintId = parseInt(req.params.id as string, 10);
      const { status } = req.body;

      // KAAM 2: Pehchan karna ki jo update karna chahta hai, wo hai kaun?
      const userId = (req as any).user.id; // Ye id humare authenticateUser middleware ne di hai

      // Database se us user ka poora data mangwate hain taaki uska 'role' check kar sakein
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      // KAAM 3: Security Check (Sirf Admin ko permission dena)
      if (currentUser?.role !== "Admin") {
        return res.status(403).json({
          success: false,
          message: "Access Denied! Sirf Admin isey update kar sakte hain.",
        });
      }

      // KAAM 4: Asli Update (Agar upar wala check pass ho gaya, toh complaint update karo)
      const updatedComplaint = await prisma.complaint.update({
        where: { id: complaintId },
        data: { status: status }, // Status ko naye wale status se badal diya
      });

      res.status(200).json({
        success: true,
        message: "Complaint status updated successfully!",
        updatedComplaint,
      });
    } catch (error) {
      console.error("Status Update Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server is secured and running on http://localhost:${PORT}`);
});
