import express from "express";
import { getAllClients, upgradeClientPlan, deleteClient, } from "../controllers/superadmin.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
const router = express.Router();
// Get all onboarded clients (colleges)
router.get("/clients", authenticateUser, getAllClients);
// 🚀 Naya route for upgrading the client plan
router.put("/clients/:id/upgrade", authenticateUser, upgradeClientPlan);
// Routes ke aakhir mein yeh DELETE route add karein:
router.delete("/clients/:id", authenticateUser, deleteClient);
export default router;
//# sourceMappingURL=superadmin.routes.js.map