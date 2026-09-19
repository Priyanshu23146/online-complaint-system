import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.findMany({ select: { name: true, email: true, role: true } }).then(console.table).finally(() => p.$disconnect());
