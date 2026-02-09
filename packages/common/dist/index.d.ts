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
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    accountType: z.ZodOptional<z.ZodEnum<{
        seeker: "seeker";
        offerer: "offerer";
    }>>;
    entityType: z.ZodOptional<z.ZodEnum<{
        municipality: "municipality";
        individual: "individual";
        realEstate: "realEstate";
        company: "company";
    }>>;
    companyName: z.ZodString;
    role: z.ZodEnum<typeof UserRole>;
}, z.core.$strip>;
export declare const nodeSchema: z.ZodObject<{
    name: z.ZodString;
    zone: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    capacity: z.ZodNumber;
    rental_rate: z.ZodNumber;
    tier: z.ZodOptional<z.ZodString>;
    os: z.ZodOptional<z.ZodString>;
    bandwidth: z.ZodOptional<z.ZodString>;
    serverModel: z.ZodOptional<z.ZodString>;
    powerKW: z.ZodOptional<z.ZodNumber>;
    surfaceArea: z.ZodOptional<z.ZodNumber>;
    constructionYear: z.ZodOptional<z.ZodNumber>;
    networkOperator: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    postcode: z.ZodOptional<z.ZodString>;
    townCity: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    additionalAddress: z.ZodOptional<z.ZodString>;
    coolingSystem: z.ZodDefault<z.ZodBoolean>;
    heatNetwork: z.ZodDefault<z.ZodBoolean>;
    electricityGenerator: z.ZodDefault<z.ZodBoolean>;
    uses: z.ZodDefault<z.ZodArray<z.ZodString>>;
    securityFeatures: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type NodeRequest = z.infer<typeof nodeSchema>;
export interface User {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
    accountType?: 'seeker' | 'offerer';
    entityType?: 'municipality' | 'individual' | 'realEstate' | 'company';
    companyName?: string;
    role: UserRole;
}
export interface AuthResponse {
    user: User;
    accessToken: string;
}
export interface Contract {
    id: string;
    nodeId: string;
    seekerId: string;
    startDate: string;
    endDate?: string;
    rentalRate: number;
    status: 'ACTIVE' | 'TERMINATED' | 'PENDING';
}
