import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: "priyanshu@admin.com" },
    data: { role: "SUPER_ADMIN" },
  });
  console.log("🚀 Success! You are now SUPER_ADMIN:", user.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
