import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { PasswordService } from '../services/PasswordService.js';
import { TokenService } from '../services/TokenService.js';
import { UserRole, registerSchema } from '@dataspace/common';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  console.log('--- Incoming Registration Request ---');
  
  // Normalize email before validation
  if (req.body.email) req.body.email = req.body.email.toLowerCase().trim();

  const result = registerSchema.safeParse(req.body);
  
  if (!result.success) {
    console.log('Validation Failed:', result.error.flatten().fieldErrors);
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: result.error.flatten().fieldErrors 
    });
  }

  const { email, password, name, companyName, role } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await PasswordService.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: name,
        companyName: companyName || 'Independent Seeker',
        role: role.toUpperCase() as any, // Force Uppercase for DB consistency
      },
    });

    console.log(`Registration Successful: ${user.email} as ${user.role}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role.toUpperCase() 
      },
    });
  } catch (error: any) {
    console.error('CRITICAL REGISTRATION ERROR:', error);
    res.status(500).json({ 
      message: 'Database error during registration', 
      error: error.message 
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    if (!user || !(await PasswordService.compare(password, user.password))) {
      console.log(`Login failed for: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userRole = user.role.toUpperCase() as UserRole;

    const payload = { 
      userId: user.id, 
      email: user.email, 
      role: userRole
    };
    
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax to help Safari with cross-site cookies if needed
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.json({
      user: { 
        id: user.id, 
        email: user.email, 
        role: userRole 
      },
      accessToken,
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;