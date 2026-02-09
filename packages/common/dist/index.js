"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeSchema = exports.registerSchema = exports.UserRole = void 0;
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
    firstName: zod_1.z.string().min(1, "First name is required").optional(),
    lastName: zod_1.z.string().min(1, "Last name is required").optional(),
    phoneNumber: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    accountType: zod_1.z.enum(['seeker', 'offerer']).optional(),
    entityType: zod_1.z.enum(['municipality', 'individual', 'realEstate', 'company']).optional(),
    companyName: zod_1.z.string().min(2, "Company name is required"),
    role: zod_1.z.nativeEnum(UserRole),
});
// New Node/Datacenter Schema
exports.nodeSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    zone: zod_1.z.string().min(2),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    capacity: zod_1.z.number(),
    rental_rate: zod_1.z.number(),
    tier: zod_1.z.string().optional(),
    os: zod_1.z.string().optional(),
    bandwidth: zod_1.z.string().optional(),
    // Technical Specs
    serverModel: zod_1.z.string().optional(),
    powerKW: zod_1.z.number().optional(),
    surfaceArea: zod_1.z.number().optional(),
    constructionYear: zod_1.z.number().optional(),
    networkOperator: zod_1.z.string().optional(),
    // Location
    country: zod_1.z.string().optional(),
    postcode: zod_1.z.string().optional(),
    townCity: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    additionalAddress: zod_1.z.string().optional(),
    // Features
    coolingSystem: zod_1.z.boolean().default(false),
    heatNetwork: zod_1.z.boolean().default(false),
    electricityGenerator: zod_1.z.boolean().default(false),
    uses: zod_1.z.array(zod_1.z.string()).default([]),
    securityFeatures: zod_1.z.array(zod_1.z.string()).default([]),
});
