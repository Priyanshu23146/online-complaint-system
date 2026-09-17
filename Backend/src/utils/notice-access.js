import { Role, NoticeVisibility } from "@prisma/client";
/**
 * 🔐 READ PRIVACY FILTER
 *
 * Ye function database query mein lagta hai jo unauthorized notices
 * ko filter out kar deta hai. Pure Prisma `where` clause mein hota hai.
 *
 * Privacy model:
 * 1. Tenant boundary first — apne org se bahar ka kuch nahi
 * 2. Phir role ke hisaab se visibility check
 */
export const buildNoticeAccessFilter = (user) => {
    const { role, organizationId, departmentId } = user;
    // ✅ Tenant boundary — ye kabhi bypass nahi hota
    const base = { organizationId };
    // ✅ ORG_ADMIN poore organization ka sab dekh sakta hai
    if (role === Role.ORG_ADMIN) {
        return base;
    }
    /**
     * Har role ke liye allowed visibility levels
     * Ye OR clause mein combine kiye jayenge
     */
    const clauses = [
        // ORG_PUBLIC sabko dikhega
        { visibility: NoticeVisibility.ORG_PUBLIC },
    ];
    // Department-scoped notices tabhi dikhenge jab:
    // 1. Notice us dept mein post hua ho
    // 2. User ka departmentId match kare
    // 3. Role ke hisaab se visibility allow ho
    if (departmentId !== null) {
        if (role === Role.MEMBER) {
            // MEMBER sirf apne dept ke DEPT_PUBLIC notice dekh sakta hai
            clauses.push({
                departmentId,
                visibility: NoticeVisibility.DEPT_PUBLIC,
            });
        }
        if (role === Role.STAFF) {
            // STAFF apne dept ke DEPT_PUBLIC + STAFF_ONLY dekh sakta hai
            clauses.push({
                departmentId,
                visibility: {
                    in: [NoticeVisibility.DEPT_PUBLIC, NoticeVisibility.STAFF_ONLY],
                },
            });
        }
        if (role === Role.DEPT_ADMIN) {
            // DEPT_ADMIN apne dept ke sab dekh sakta hai
            clauses.push({
                departmentId,
                visibility: {
                    in: [
                        NoticeVisibility.DEPT_PUBLIC,
                        NoticeVisibility.STAFF_ONLY,
                        NoticeVisibility.DEPT_ADMIN_ONLY,
                    ],
                },
            });
        }
    }
    // SUPER_ADMIN ko client org ke notices nahi dikhenge
    // (platform owner ko interference nahi hona)
    return { ...base, OR: clauses };
};
/**
 * 🔐 CREATE ALLOWLIST
 *
 * Har role kaunsi visibility use karke notice post kar sakta hai
 */
export const ALLOWED_VISIBILITY = {
    SUPER_ADMIN: [], // platform owner interference nahi karta
    ORG_ADMIN: [
        NoticeVisibility.ORG_PUBLIC,
        NoticeVisibility.DEPT_PUBLIC,
        NoticeVisibility.STAFF_ONLY,
        NoticeVisibility.DEPT_ADMIN_ONLY,
    ],
    DEPT_ADMIN: [
        NoticeVisibility.DEPT_PUBLIC,
        NoticeVisibility.STAFF_ONLY,
        NoticeVisibility.DEPT_ADMIN_ONLY,
    ],
    STAFF: [NoticeVisibility.DEPT_PUBLIC, NoticeVisibility.STAFF_ONLY],
    MEMBER: [], // MEMBER sirf complaints aur comments kar sakta hai
};
/**
 * Helper: check karo ki ye role ye visibility use kar sakta hai
 */
export const canUseVisibility = (role, visibility) => {
    return ALLOWED_VISIBILITY[role]?.includes(visibility) ?? false;
};
export default {
    buildNoticeAccessFilter,
    ALLOWED_VISIBILITY,
    canUseVisibility,
};
//# sourceMappingURL=notice-access.js.map