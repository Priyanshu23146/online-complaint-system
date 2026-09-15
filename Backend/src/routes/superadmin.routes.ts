import express from "express";
import {
  getAllClients,
  upgradeClientPlan,
  deleteClient,
} from "../controllers/superadmin.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.use(authenticateUser, authorize("SUPER_ADMIN"));

router.get("/clients", getAllClients);
router.put("/clients/:id/upgrade", upgradeClientPlan);
router.delete("/clients/:id", deleteClient);

export default router;
