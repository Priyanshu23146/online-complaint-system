import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import {
  getAnalytics,
  getDepartmentAnalytics,
} from "../controllers/analytics.controller.js";

const router = Router();

// Only ORG_ADMIN, DEPT_ADMIN, STAFF can see analytics
router.get(
  "/",
  authenticateUser,
  authorize("ORG_ADMIN", "DEPT_ADMIN", "STAFF"),
  getAnalytics,
);

router.get(
  "/department/:departmentId",
  authenticateUser,
  authorize("DEPT_ADMIN", "STAFF"),
  getDepartmentAnalytics,
);

export default router;
