import express from "express";
import { createDepartment, getDepartments, assignAdmin, deleteDepartment, } from "../controllers/department.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createDepartmentSchema, assignAdminSchema, } from "../validators/department.validator.js";
const router = express.Router();
// 🚨 CRITICAL FIX: this ENTIRE router had NO auth middleware before —
// anyone, logged in or not, could create/delete departments for any org.
router.use(authenticateUser);
router.post("/", authorize("ORG_ADMIN"), validate(createDepartmentSchema), createDepartment);
router.get("/", authorize("ORG_ADMIN", "DEPT_ADMIN", "STAFF", "MEMBER"), getDepartments);
router.delete("/:id", authorize("ORG_ADMIN"), deleteDepartment);
router.post("/:id/assign-admin", authorize("ORG_ADMIN"), validate(assignAdminSchema), assignAdmin);
export default router;
//# sourceMappingURL=department.routes.js.map