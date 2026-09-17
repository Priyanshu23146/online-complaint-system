import { Role } from "@prisma/client";
/**
 * 🔐 Role Hierarchy Level
 * Neeche jitna bada number, utna zyada power hai
 */
export declare const ROLE_LEVEL: Record<Role, number>;
/**
 * 🔐 Who Can Create Whom
 * Core rule: sirf apne se neeche wale roles create kar sakte ho
 *
 * Example:
 * - SUPER_ADMIN sirf ORG_ADMIN create kar sakta hai
 * - ORG_ADMIN DEPT_ADMIN, STAFF, MEMBER create kar sakta hai
 * - DEPT_ADMIN sirf STAFF aur MEMBER create kar sakta hai
 */
export declare const CAN_CREATE: Record<Role, Role[]>;
/**
 * 🔐 Helper function
 * Ye check karta hai ki actor, target role create kar sakta hai ya nahi
 */
export declare const canCreateRole: (actor: Role, target: Role) => boolean;
declare const _default: {
    ROLE_LEVEL: Record<import(".prisma/client").$Enums.Role, number>;
    CAN_CREATE: Record<import(".prisma/client").$Enums.Role, import(".prisma/client").$Enums.Role[]>;
    canCreateRole: (actor: Role, target: Role) => boolean;
};
export default _default;
//# sourceMappingURL=roles.d.ts.map