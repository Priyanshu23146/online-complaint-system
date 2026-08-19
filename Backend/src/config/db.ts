import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Isey 'export' kar rahe hain taaki baaki files iska use kar sakein
export const prisma = new PrismaClient({ adapter });
