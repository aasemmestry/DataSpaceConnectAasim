import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_123';

// --- REGISTER ROUTE ---
router.post('/register', async (req: Request, res: Response) => {
  console.log('--- Incoming Registration Request ---');
  
  try {
    // 1. Basic Validation & Normalization
    let { email, password, name, companyName, role, firstName, lastName, phoneNumber, country, accountType, entityType } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    email = email.toLowerCase().trim();

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash Password (Directly using bcryptjs to match seed script)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: name || `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        phoneNumber,
        country: country || 'Global',
        accountType: accountType || 'seeker',
        entityType: entityType || 'Individual',
        companyName: companyName || 'Independent Seeker',
        role: role ? role.toUpperCase() : 'SEEKER',
      },
    });

    console.log(`Registration Successful: ${user.email} as ${user.role}`);
    
    // 5. Generate Token immediately so they don't have to login
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token, // Return Access Token
      user: { id: user.id, email: user.email, role: user.role, companyName: user.companyName },
    });

  } catch (error: any) {
    console.error('CRITICAL REGISTRATION ERROR:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;
    
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    if (!user) {
      console.log(`Login failed: User not found (${normalizedEmail})`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare Password (Explicitly using bcryptjs)
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log(`Login failed: Bad password for ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate Payload
    const payload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    // 4. Generate Tokens
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // 5. Handle Cookies (Preserving your Pro configuration)
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction, // False on localhost, True on Prod
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    console.log(`Login Success: ${user.email}`);

    res.json({
      token: accessToken, // Frontend usually expects "token" or "accessToken"
      accessToken,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        companyName: user.companyName,
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- LOGOUT ROUTE ---
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

export default router;