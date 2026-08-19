import express from "express";
import authenticateUser from "../middlewares/auth.middleware.js";
import { 
  createComplaint, 
  getComplaints, 
  updateComplaintStatus, 
  deleteComplaint 
} from "../controllers/complaint.controller.js";

const router = express.Router();

// Har route par 'authenticateUser' middleware laga diya hai
router.post("/", authenticateUser, createComplaint);
router.get("/", authenticateUser, getComplaints);
router.put("/:id/status", authenticateUser, updateComplaintStatus);
router.delete("/:id", authenticateUser, deleteComplaint);

export default router;