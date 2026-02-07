import { z } from 'zod';
export declare enum UserRole {
    OFFERER = "OFFERER",
    SEEKER = "SEEKER",
    ADMIN = "ADMIN"
}
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    companyName: z.ZodString;
    role: z.ZodEnum<typeof UserRole>;
}, z.core.$strip>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export interface User {
    id: string;
    email: string;
    name?: string;
    companyName?: string;
    role: UserRole;
}
export interface AuthResponse {
    user: User;
    accessToken: string;
}
//# sourceMappingURL=index.d.ts.map