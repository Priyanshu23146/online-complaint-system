import {} from "express";
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, message: "Not authenticated." });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of: ${allowedRoles.join(", ")}`,
            });
        }
        next();
    };
};
//# sourceMappingURL=rbac.middleware.js.map