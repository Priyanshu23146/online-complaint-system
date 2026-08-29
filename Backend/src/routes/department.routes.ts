import express from "express";
import {
  createDepartment,
  getDepartments,
} from "../controllers/department.controller.js";

const router = express.Router();

router.post("/", createDepartment); // Naya department banane ke liye
router.get("/", getDepartments); // Saare departments list karne ke liye

export default router;
