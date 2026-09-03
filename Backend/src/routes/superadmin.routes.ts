import express from "express";
import { getAllClients } from "../controllers/superadmin.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all onboarded clients (colleges)
router.get("/clients", authenticateUser, getAllClients);

export default router;
