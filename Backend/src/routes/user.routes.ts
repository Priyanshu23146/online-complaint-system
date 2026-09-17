import express from "express";
import { createUser, getUsers } from "../controllers/user.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserSchema } from "../validators/user.validator.js";

const router = express.Router();

/**
 * 🔐 All routes require authentication
 */
router.use(authenticateUser);

/**
 * ✍️ User creation — sirf ORG_ADMIN aur DEPT_ADMIN
 */
router.post(
  "/",
  authorize("ORG_ADMIN", "DEPT_ADMIN"),
  validate(createUserSchema),
  createUser,
);

/**
 * 📖 List users — sirf ORG_ADMIN aur DEPT_ADMIN
 */
router.get("/", authorize("ORG_ADMIN", "DEPT_ADMIN"), getUsers);

export default router;
