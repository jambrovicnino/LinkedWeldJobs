import { Router, Request, Response } from 'express';
import { createUser, findUserByEmail, findUserById, findUserByVerificationCode, updateUser, storeRefreshToken, findRefreshToken, deleteRefreshToken } from '../db';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendVerificationEmail } from '../utils/email';

const router = Router();

function safeUser(user: any) {
  const { password, verificationCode, ...safe } = user;
  return safe;
}

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await hashPassword(password);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

    const user = createUser({
      email,
      password: hashed,
      firstName,
      lastName,
      phone: phone || null,
      role: 'candidate',
      subscription: 'free',
      isVerified: false,
      verificationCode,
      profileHeadline: null,
      bio: null,
      location: null,
      nationality: null,
      weldingTypes: [],
      experienceYears: null,
      certifications: [],
      availableFrom: null,
      willingToRelocate: false,
      preferredCountries: [],
      avatarUrl: null,
      resumeUrl: null,
    });

    // Send verification email
    sendVerificationEmail(email, verificationCode, firstName).catch(err => {
      console.error('Email send failed:', err);
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    storeRefreshToken(user.id, refreshToken);

    res.status(201).json({
      data: {
        user: safeUser(user),
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = findUserByEmail(email);

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    storeRefreshToken(user.id, refreshToken);

    res.json({
      data: {
        user: safeUser(user),
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify email
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const user = findUserByVerificationCode(code);
    if (!user) return res.status(400).json({ error: 'Invalid verification code' });

    updateUser(user.id, { isVerified: true, verificationCode: null });
    res.json({ data: { message: 'Email verified' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Refresh token
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);

    const stored = findRefreshToken(refreshToken, decoded.userId);
    if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });

    // Rotate
    deleteRefreshToken(refreshToken);
    const newAccess = generateAccessToken(decoded.userId);
    const newRefresh = generateRefreshToken(decoded.userId);
    storeRefreshToken(decoded.userId, newRefresh);

    res.json({ data: { accessToken: newAccess, refreshToken: newRefresh } });
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    deleteRefreshToken(refreshToken);
  }
  res.json({ data: { message: 'Logged out' } });
});

// Get me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = findUserById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ data: safeUser(user) });
});

// Update profile
router.put('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    const allowed = ['firstName', 'lastName', 'phone', 'profileHeadline', 'bio', 'location', 'nationality', 'weldingTypes', 'experienceYears', 'certifications', 'availableFrom', 'willingToRelocate', 'preferredCountries'];

    const filtered: any = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        filtered[key] = updates[key];
      }
    }

    if (Object.keys(filtered).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = updateUser(req.userId!, filtered);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ data: safeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
