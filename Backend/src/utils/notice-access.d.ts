import { Role, NoticeVisibility, type Prisma } from "@prisma/client";
import type { AuthUser } from "../types/auth-user.js";
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
export declare const buildNoticeAccessFilter: (user: AuthUser) => Prisma.NoticeWhereInput;
/**
 * 🔐 CREATE ALLOWLIST
 *
 * Har role kaunsi visibility use karke notice post kar sakta hai
 */
export declare const ALLOWED_VISIBILITY: Record<Role, NoticeVisibility[]>;
/**
 * Helper: check karo ki ye role ye visibility use kar sakta hai
 */
export declare const canUseVisibility: (role: Role, visibility: NoticeVisibility) => boolean;
declare const _default: {
    buildNoticeAccessFilter: (user: AuthUser) => Prisma.NoticeWhereInput;
    ALLOWED_VISIBILITY: Record<import(".prisma/client").$Enums.Role, import(".prisma/client").$Enums.NoticeVisibility[]>;
    canUseVisibility: (role: Role, visibility: NoticeVisibility) => boolean;
};
export default _default;
//# sourceMappingURL=notice-access.d.ts.map