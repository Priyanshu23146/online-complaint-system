import { type Request, type Response, type NextFunction } from "express";
import { type ZodType } from "zod";
export declare const validate: (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => any;
//# sourceMappingURL=validate.middleware.d.ts.map