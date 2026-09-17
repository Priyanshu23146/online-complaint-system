import express from "express";
import { register, login, forceChangePassword, onboardClient, } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, forceChangePasswordSchema, onboardClientSchema, } from "../validators/auth.validator.js";
const router = express.Router();
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
// 🚨 FIX: now requires a valid login — was completely public before
router.post("/force-change-password", authenticateUser, validate(forceChangePasswordSchema), forceChangePassword);
// 🚨 FIX: onboarding a new client org is now SUPER_ADMIN only — was public before
router.post("/onboard", authenticateUser, authorize("SUPER_ADMIN"), validate(onboardClientSchema), onboardClient);
export default router;
//# sourceMappingURL=auth.routes.js.map