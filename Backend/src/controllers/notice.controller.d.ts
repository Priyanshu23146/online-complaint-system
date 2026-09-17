import { type Request, type Response } from "express";
/**
 * 🚀 CREATE NOTICE
 *
 * 🔐 Privacy Rules:
 * 1. Role ke hisaab se visibility restrict ho
 * 2. departmentId token se aaye, body se nahi (spoofing block)
 * 3. ORG_ADMIN choose kar sakta hai, DEPT_ADMIN का fixed hai
 */
export declare const createNotice: (req: Request, res: Response) => Promise<any>;
/**
 * 🚀 GET NOTICES (Paginated)
 *
 * 🔐 DB-level filtering lagti hai — har user ko sirf wo notices dikhenge
 *    jo wo access kar sakte hain
 */
export declare const getNotices: (req: Request, res: Response) => Promise<any>;
/**
 * 🚀 GET SINGLE NOTICE BY ID
 *
 * Even direct ID lookup mein access filter lagta hai
 * (404 return hota hai, 403 nahi — info leak block karne ke liye)
 */
export declare const getNoticeById: (req: Request, res: Response) => Promise<any>;
/**
 * 🚀 UPDATE NOTICE
 *
 * 🔐 Ownership check: sirf creator ya ORG_ADMIN edit kar sakte hain
 */
export declare const updateNotice: (req: Request, res: Response) => Promise<any>;
/**
 * 🚀 DELETE NOTICE
 *
 * Same ownership rule as update
 */
export declare const deleteNotice: (req: Request, res: Response) => Promise<any>;
//# sourceMappingURL=notice.controller.d.ts.map