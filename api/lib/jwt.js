import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'oafcodify-secret-key-change-this-in-production';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function setTokenCookie(res, token) {
  res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`);
}

export function clearTokenCookie(res) {
  res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
}
