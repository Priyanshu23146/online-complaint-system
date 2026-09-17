import type { Role } from "@prisma/client";
export interface AuthUser {
    id: number;
    role: Role;
    organizationId: number;
    departmentId: number | null;
}
//# sourceMappingURL=auth-user.d.ts.map