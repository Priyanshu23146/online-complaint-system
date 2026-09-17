import {} from "express";
import { Role, NoticeVisibility } from "@prisma/client";
import { prisma } from "../config/db.js";
import { buildNoticeAccessFilter, canUseVisibility, } from "../utils/notice-access.js";
/**
 * 🚀 CREATE NOTICE
 *
 * 🔐 Privacy Rules:
 * 1. Role ke hisaab se visibility restrict ho
 * 2. departmentId token se aaye, body se nahi (spoofing block)
 * 3. ORG_ADMIN choose kar sakta hai, DEPT_ADMIN का fixed hai
 */
export const createNotice = async (req, res) => {
    try {
        const { title, content, visibility, departmentId: bodyDeptId } = req.body;
        const { id: userId, role, organizationId, departmentId: tokenDeptId, } = req.user;
        // 🔐 Privacy Rule 1: role apni allowed visibility hi use kar sakta hai
        if (!canUseVisibility(role, visibility)) {
            return res.status(403).json({
                success: false,
                message: `Your role (${role}) cannot create a ${visibility} notice.`,
            });
        }
        // 🔐 Privacy Rule 2 & 3: departmentId resolution
        let resolvedDeptId;
        if (role === Role.ORG_ADMIN) {
            // ORG_ADMIN ORG_PUBLIC notice ke liye dept nahi chahiye
            if (visibility === NoticeVisibility.ORG_PUBLIC) {
                resolvedDeptId = null;
            }
            else {
                // Dept-specific notice — body se check karo
                if (!bodyDeptId) {
                    return res.status(400).json({
                        success: false,
                        message: "departmentId is required for department-scoped notices.",
                    });
                }
                // Ye dept apne org mein hai na?
                const dept = await prisma.department.findFirst({
                    where: { id: bodyDeptId, organizationId },
                });
                if (!dept) {
                    return res.status(400).json({
                        success: false,
                        message: "That department does not belong to your organization.",
                    });
                }
                resolvedDeptId = dept.id;
            }
        }
        else if (role === Role.DEPT_ADMIN || role === Role.STAFF) {
            // DEPT_ADMIN aur STAFF sirf apne dept mein notice kar sakte hain
            if (tokenDeptId === null) {
                return res.status(400).json({
                    success: false,
                    message: "You are not assigned to any department.",
                });
            }
            resolvedDeptId = tokenDeptId;
        }
        else {
            // MEMBER notice post nahi kar sakta (route-level validation se bhi block hota hai)
            return res.status(403).json({
                success: false,
                message: "Your role is not allowed to create notices.",
            });
        }
        const notice = await prisma.notice.create({
            data: {
                title,
                content,
                visibility: visibility,
                organizationId,
                departmentId: resolvedDeptId,
                createdById: userId,
            },
            include: {
                createdBy: { select: { id: true, name: true, role: true } },
                department: { select: { name: true } },
            },
        });
        res.status(201).json({
            success: true,
            message: "Notice posted successfully",
            notice,
        });
    }
    catch (error) {
        console.error("Create Notice Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating notice",
        });
    }
};
/**
 * 🚀 GET NOTICES (Paginated)
 *
 * 🔐 DB-level filtering lagti hai — har user ko sirf wo notices dikhenge
 *    jo wo access kar sakte hain
 */
export const getNotices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = buildNoticeAccessFilter(req.user);
        const notices = await prisma.notice.findMany({
            where,
            skip,
            take: limit,
            include: {
                createdBy: { select: { id: true, name: true, role: true } },
                department: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        const total = await prisma.notice.count({ where });
        res.status(200).json({
            success: true,
            metadata: {
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            },
            notices,
        });
    }
    catch (error) {
        console.error("Fetch Notices Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching notices",
        });
    }
};
/**
 * 🚀 GET SINGLE NOTICE BY ID
 *
 * Even direct ID lookup mein access filter lagta hai
 * (404 return hota hai, 403 nahi — info leak block karne ke liye)
 */
export const getNoticeById = async (req, res) => {
    try {
        const noticeId = parseInt(req.params.id, 10);
        const notice = await prisma.notice.findFirst({
            where: {
                AND: [{ id: noticeId }, buildNoticeAccessFilter(req.user)],
            },
            include: {
                createdBy: { select: { id: true, name: true, role: true } },
                department: { select: { name: true } },
            },
        });
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found",
            });
        }
        res.status(200).json({
            success: true,
            notice,
        });
    }
    catch (error) {
        console.error("Fetch Notice Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
/**
 * 🚀 UPDATE NOTICE
 *
 * 🔐 Ownership check: sirf creator ya ORG_ADMIN edit kar sakte hain
 */
export const updateNotice = async (req, res) => {
    try {
        const noticeId = parseInt(req.params.id, 10);
        const { id: userId, role, organizationId } = req.user;
        const { title, content, visibility } = req.body;
        // Pehle notice dhundo
        const notice = await prisma.notice.findFirst({
            where: { id: noticeId, organizationId },
        });
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found",
            });
        }
        // Ownership check
        const isOwner = notice.createdById === userId;
        if (!isOwner && role !== Role.ORG_ADMIN) {
            return res.status(403).json({
                success: false,
                message: "You can only edit notices you created.",
            });
        }
        // Agar visibility change ho raha hai to allowlist check karo
        if (visibility && !canUseVisibility(role, visibility)) {
            return res.status(403).json({
                success: false,
                message: `Your role (${role}) cannot set visibility to ${visibility}.`,
            });
        }
        const updated = await prisma.notice.update({
            where: { id: noticeId },
            data: {
                ...(title ? { title } : {}),
                ...(content ? { content } : {}),
                ...(visibility ? { visibility: visibility } : {}),
            },
        });
        res.status(200).json({
            success: true,
            message: "Notice updated",
            notice: updated,
        });
    }
    catch (error) {
        console.error("Update Notice Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
/**
 * 🚀 DELETE NOTICE
 *
 * Same ownership rule as update
 */
export const deleteNotice = async (req, res) => {
    try {
        const noticeId = parseInt(req.params.id, 10);
        const { id: userId, role, organizationId } = req.user;
        const notice = await prisma.notice.findFirst({
            where: { id: noticeId, organizationId },
        });
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found",
            });
        }
        if (notice.createdById !== userId && role !== Role.ORG_ADMIN) {
            return res.status(403).json({
                success: false,
                message: "You can only delete notices you created.",
            });
        }
        await prisma.notice.delete({ where: { id: noticeId } });
        res.status(200).json({
            success: true,
            message: "Notice deleted",
        });
    }
    catch (error) {
        console.error("Delete Notice Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
//# sourceMappingURL=notice.controller.js.map