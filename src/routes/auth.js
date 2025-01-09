import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = 'your-secret-key';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = userSchema.parse(req.body);
    
    if (findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    createUser({ email, password: hashedPassword, name });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/signout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', auth, (req, res) => {
  const user = findUserByEmail(req.user.email);
  res.json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

export { router as authRouter };
