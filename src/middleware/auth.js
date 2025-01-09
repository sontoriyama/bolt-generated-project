import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../db/index.js';

const JWT_SECRET = 'your-secret-key';

export function auth(req, res, next) {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserByEmail(decoded.email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
