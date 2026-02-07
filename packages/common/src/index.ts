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
  companyName: z.string().min(2, "Company name is required"),
  role: z.nativeEnum(UserRole),
});

// 3. Types and Interfaces
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