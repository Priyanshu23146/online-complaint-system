import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";

// Routers import
import authRoutes from "./routes/auth.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ==========================================
// ROUTES (Saare routes ek sath)
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/superadmin", superAdminRoutes);

// ==========================================
// 🚨 SAFETY NET (Hamesha sabse last mein)
// ==========================================
app.use(errorHandler);

// ==========================================
// SERVER START
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is secured and running on http://localhost:${PORT}`);
});
