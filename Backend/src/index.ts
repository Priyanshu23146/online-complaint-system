import "dotenv/config";
import express from "express";

// Routers import kar rahe hain
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ==========================================
// ROUTES
// ==========================================
// Authentication wale requests
app.use("/api/auth", authRoutes);

// Complaints wale requests
app.use("/api/complaints", complaintRoutes);

// ==========================================
// SERVER START
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is secured and running on http://localhost:${PORT}`);
});
