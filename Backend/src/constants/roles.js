import { Role } from "@prisma/client";
/**
 * 🔐 Role Hierarchy Level
 * Neeche jitna bada number, utna zyada power hai
 */
export const ROLE_LEVEL = {
    MEMBER: 1, // sirf apne aap ko dekh sakta hai
    STAFF: 2, // department level access
    DEPT_ADMIN: 3, // apne dept ko manage kar sakta hai
    ORG_ADMIN: 4, // poore org ko manage karta hai
    SUPER_ADMIN: 5, // platform owner — multiple orgs
};
/**
 * 🔐 Who Can Create Whom
 * Core rule: sirf apne se neeche wale roles create kar sakte ho
 *
 * Example:
 * - SUPER_ADMIN sirf ORG_ADMIN create kar sakta hai
 * - ORG_ADMIN DEPT_ADMIN, STAFF, MEMBER create kar sakta hai
 * - DEPT_ADMIN sirf STAFF aur MEMBER create kar sakta hai
 */
export const CAN_CREATE = {
    SUPER_ADMIN: ["ORG_ADMIN"],
    ORG_ADMIN: ["DEPT_ADMIN", "STAFF", "MEMBER"],
    DEPT_ADMIN: ["STAFF", "MEMBER"],
    STAFF: [],
    MEMBER: [],
};
/**
 * 🔐 Helper function
 * Ye check karta hai ki actor, target role create kar sakta hai ya nahi
 */
export const canCreateRole = (actor, target) => {
    return CAN_CREATE[actor]?.includes(target) ?? false;
};
export default { ROLE_LEVEL, CAN_CREATE, canCreateRole };
//# sourceMappingURL=roles.js.map