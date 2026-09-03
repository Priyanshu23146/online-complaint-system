import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    // 👇 Yahan Priyanshu@223.com ya apna exact login email daaliye
    where: { email: "Priyanshu@223.com" },
    data: { role: "SUPER_ADMIN" },
  });
  console.log("🚀 Success! You are now SUPER_ADMIN:", user.name);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
