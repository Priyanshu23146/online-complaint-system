import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    organizationCode: z.ZodString;
    departmentId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const forceChangePasswordSchema: z.ZodObject<{
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const onboardClientSchema: z.ZodObject<{
    organizationName: z.ZodString;
    organizationCode: z.ZodString;
    adminName: z.ZodString;
    adminEmail: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=auth.validator.d.ts.map