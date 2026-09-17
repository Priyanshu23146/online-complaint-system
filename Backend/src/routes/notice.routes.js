import express from "express";
import { createNotice, getNotices, getNoticeById, updateNotice, deleteNotice, } from "../controllers/notice.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createNoticeSchema, updateNoticeSchema, } from "../validators/notice.validator.js";
const router = express.Router();
/**
 * 🔐 All routes require authentication
 */
router.use(authenticateUser);
/**
 * 📖 READ endpoints — sabhi kar sakte hain
 * (phir bhi DB filter apne aap lagti hai)
 */
router.get("/", getNotices);
router.get("/:id", getNoticeById);
/**
 * ✍️ WRITE endpoints — MEMBER nahi kar sakta
 */
router.post("/", authorize("ORG_ADMIN", "DEPT_ADMIN", "STAFF"), validate(createNoticeSchema), createNotice);
router.put("/:id", authorize("ORG_ADMIN", "DEPT_ADMIN", "STAFF"), validate(updateNoticeSchema), updateNotice);
router.delete("/:id", authorize("ORG_ADMIN", "DEPT_ADMIN", "STAFF"), deleteNotice);
export default router;
//# sourceMappingURL=notice.routes.js.map