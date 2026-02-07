"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = require("zod");
// List of blocked free email providers to ensure B2B quality
const blockedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(50, 'Full name is too long'),
    companyName: zod_1.z
        .string()
        .min(2, 'Company name is required'),
    email: zod_1.z
        .string()
        .email('Invalid email address')
        .refine((email) => {
        const domain = email.split('@')[1];
        return !blockedDomains.includes(domain.toLowerCase() || '');
    }, {
        message: 'Please use a professional company email address (no Gmail/Yahoo/etc.)',
    }),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: zod_1.z.string(),
    // Using a cleaner way to handle the enum that avoids the overload error
    role: zod_1.z.string().refine((val) => {
        return ["OFFERER", "SEEKER"].includes(val);
    }, {
        message: "Please select whether you are an Offerer or a Seeker"
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
