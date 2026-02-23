import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'linkedweldjobs-access-secret-dev';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'linkedweldjobs-refresh-secret-dev';

export interface TokenPayload {
  userId: number;
}

export function generateAccessToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

export function getUserFromRequest(req: any): TokenPayload | null {
  const authHeader = req.headers?.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
