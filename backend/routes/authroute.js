// routes/authRoutes.js

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import jwt
import User from '../models/user.js';

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  const { name, cnic, contact, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      cnic,
      contact,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//  POST /login with JWT
router.post('/login', async (req, res) => {
  const { cnic, password } = req.body || {};

  try {
    if (!cnic || !password) {
      return res.status(400).json({ message: 'CNIC and password are required' });
    }

    const user = await User.findOne({ cnic });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate stored password exists and looks like a bcrypt hash
    if (!user.password || typeof user.password !== 'string' || !user.password.startsWith('$2')) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (cmpErr) {
      // Treat any compare error as invalid credentials
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    // Create JWT
    const token = jwt.sign(
      { userId: user._id },
      secret,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        premium: user.isPremium || false,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
