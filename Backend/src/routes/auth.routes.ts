import express from "express";
import {
  register,
  login,
  forceChangePassword,
  onboardClient,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/force-change-password", forceChangePassword);
router.post("/onboard-client", onboardClient); // 🚀 Naya Route

export default router;
