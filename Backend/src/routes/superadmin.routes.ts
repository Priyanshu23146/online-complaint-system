import express from "express";
import {
  getAllClients,
  upgradeClientPlan,
} from "../controllers/superadmin.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all onboarded clients (colleges)
router.get("/clients", authenticateUser, getAllClients);

// 🚀 Naya route for upgrading the client plan
router.put("/clients/:id/upgrade", authenticateUser, upgradeClientPlan);

export default router;
