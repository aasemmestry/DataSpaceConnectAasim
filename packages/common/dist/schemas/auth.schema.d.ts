import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    fullName: z.ZodString;
    companyName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    role: z.ZodString & z.ZodType<"OFFERER" | "SEEKER", string, z.core.$ZodTypeInternals<"OFFERER" | "SEEKER", string>>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
//# sourceMappingURL=auth.schema.d.ts.map