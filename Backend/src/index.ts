import { errorHandler } from "./middlewares/error.middleware.js";
import "dotenv/config";
import express from "express";
import cors from "cors"; // 👈 Naya import

// Routers import kar rahe hain
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";

const app = express();

app.use(cors()); // 👈 Security guard ko pass de diya
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ==========================================
// ROUTES
// ==========================================
// Authentication wale requests
app.use("/api/auth", authRoutes);

// Complaints wale requests
app.use("/api/complaints", complaintRoutes);

// 🚨 YAHAN LAGANA HAI HAMARA SAFETY NET (Sab routes ke baad)
app.use(errorHandler);

// ==========================================
// SERVER START
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is secured and running on http://localhost:${PORT}`);
});
