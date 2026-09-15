import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "../validators/complaint.validator.js";
import {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  deleteComplaint,
} from "../controllers/complaint.controller.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", validate(createComplaintSchema), createComplaint);
router.get("/", getComplaints);
router.put(
  "/:id/status",
  validate(updateComplaintStatusSchema),
  updateComplaintStatus,
);
router.delete("/:id", deleteComplaint);

export default router;
