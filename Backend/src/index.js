import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/error.middleware.js";
import noticeRoutes from "./routes/notice.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";
// 🚨 FIX: fail fast at boot instead of silently falling back to "supersecret"
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables. Refusing to start.");
}
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
// 🚨 FIX: basic brute-force protection on the most sensitive endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: "Too many attempts, please try again later.",
    },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
const PORT = process.env.PORT || 5000;
app.use("/api/auth", authRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/users", userRoutes);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is secured and running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map