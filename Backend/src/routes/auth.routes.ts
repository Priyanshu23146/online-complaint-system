import express from "express";
import {
  register,
  login,
  forceChangePassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/force-change-password", forceChangePassword); // 🚀 Naya Route

export default router;
