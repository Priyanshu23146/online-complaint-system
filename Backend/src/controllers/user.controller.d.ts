import { type Request, type Response } from "express";
/**
 * 🚀 CREATE USER
 *
 * Single endpoint jo hierarchy ko follow karta hai
 *
 * 🔐 Privacy Rules:
 * 1. Actor sirf apne se neeche wale role create kar sakta hai
 * 2. departmentId token se aaye, body se nahi
 * 3. Temp password generate hota hai, mustChangePassword = true
 */
export declare const createUser: (req: Request, res: Response) => Promise<any>;
/**
 * 🚀 LIST USERS
 *
 * 🔐 Scoped list:
 * - ORG_ADMIN — poore org ke users
 * - DEPT_ADMIN — sirf apne dept ke users
 */
export declare const getUsers: (req: Request, res: Response) => Promise<any>;
//# sourceMappingURL=user.controller.d.ts.map