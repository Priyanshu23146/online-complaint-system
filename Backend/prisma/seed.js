import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
    const SUPER_ADMIN_EMAIL = "superadmin@platform.local";
    const SUPER_ADMIN_PASSWORD = "ChangeMe123!"; // 🚨 pehle login ke baad turant badlo
    const existing = await prisma.user.findUnique({
        where: { email: SUPER_ADMIN_EMAIL },
    });
    if (existing) {
        console.log("Super admin already exists, skipping.");
        return;
    }
    const platformOrg = await prisma.organization.create({
        data: { name: "Platform", domain: "platform-internal" },
    });
    const hashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
    await prisma.user.create({
        data: {
            name: "Platform Super Admin",
            email: SUPER_ADMIN_EMAIL,
            password: hashed,
            role: "SUPER_ADMIN",
            organizationId: platformOrg.id,
            mustChangePassword: true,
        },
    });
    console.log("✅ Super admin created:", SUPER_ADMIN_EMAIL, "| temp password:", SUPER_ADMIN_PASSWORD);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=seed.js.map