import express from "express";
import {
  createDepartment,
  getDepartments,
  assignAdmin,
  deleteDepartment,
} from "../controllers/department.controller.js";

const router = express.Router();

router.post("/", createDepartment); // Naya department banane ke liye
router.get("/", getDepartments); // Saare departments list karne ke liye
router.delete("/:id", deleteDepartment); // 🚀 Naya Delete Route
router.post("/:id/assign-admin", assignAdmin); // 🚀 Naya Route
export default router;
