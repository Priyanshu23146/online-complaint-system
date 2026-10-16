import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../middlewares/rbac.middleware.js";
import {
  getAnalytics,
  getDepartmentAnalytics,
} from "../controllers/analytics.controller.js";

const router = Router();

// Only ORG_ADMIN, DEPT_ADMIN, STAFF can see analytics
router.get(
  "/",
  authMiddleware,
  rbacMiddleware(["ORG_ADMIN", "DEPT_ADMIN", "STAFF"]),
  getAnalytics,
);

router.get(
  "/department/:departmentId",
  authMiddleware,
  rbacMiddleware(["DEPT_ADMIN", "STAFF"]),
  getDepartmentAnalytics,
);

export default router;
