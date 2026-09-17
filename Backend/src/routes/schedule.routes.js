import express from "express";
import multer from "multer";
import { uploadAndParseTimetable, getSchedules, } from "../controllers/schedule.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.use(authenticateUser);
router.post("/upload", authorize("ORG_ADMIN", "DEPT_ADMIN"), upload.single("scheduleImage"), uploadAndParseTimetable);
router.get("/", getSchedules);
export default router;
//# sourceMappingURL=schedule.routes.js.map