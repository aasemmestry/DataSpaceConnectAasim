import { z } from 'zod';

// 1. Explicitly export the enum
export enum UserRole {
  OFFERER = 'OFFERER',
  SEEKER = 'SEEKER',
  ADMIN = 'ADMIN'
}

// 2. Updated schema
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
  accountType: z.enum(['seeker', 'offerer']).optional(),
  entityType: z.enum(['municipality', 'individual', 'realEstate', 'company']).optional(),
  companyName: z.string().min(2, "Company name is required"),
  role: z.nativeEnum(UserRole),
});

// New Node/Datacenter Schema
export const nodeSchema = z.object({
  name: z.string().min(2),
  zone: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  capacity: z.number(),
  rental_rate: z.number(),
  tier: z.string().optional(),
  os: z.string().optional(),
  bandwidth: z.string().optional(),
  
  // Technical Specs
  serverModel: z.string().optional(),
  powerKW: z.number().optional(),
  surfaceArea: z.number().optional(),
  constructionYear: z.number().optional(),
  networkOperator: z.string().optional(),
  
  // Location
  country: z.string().optional(),
  postcode: z.string().optional(),
  townCity: z.string().optional(),
  address: z.string().optional(),
  additionalAddress: z.string().optional(),
  
  // Features
  coolingSystem: z.boolean().default(false),
  heatNetwork: z.boolean().default(false),
  electricityGenerator: z.boolean().default(false),
  uses: z.array(z.string()).default([]),
  securityFeatures: z.array(z.string()).default([]),
});

// 3. Types and Interfaces
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