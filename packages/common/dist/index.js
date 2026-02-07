"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.UserRole = void 0;
const zod_1 = require("zod");
// 1. Explicitly export the enum
var UserRole;
(function (UserRole) {
    UserRole["OFFERER"] = "OFFERER";
    UserRole["SEEKER"] = "SEEKER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
// 2. Updated schema
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    name: zod_1.z.string().optional(),
    companyName: zod_1.z.string().min(2, "Company name is required"),
    role: zod_1.z.nativeEnum(UserRole),
});
