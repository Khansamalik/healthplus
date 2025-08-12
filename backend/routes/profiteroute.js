import express from "express";
import User from "../models/user.js";
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';

const profilerouter = express.Router();

// Multer storage for avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve('uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `avatar-${unique}${ext}`);
  },
});
const upload = multer({ storage });

profilerouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // or use email/token
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
profilerouter.put('/:id', async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedUser);
});

// Upload avatar
profilerouter.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: fileUrl },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Avatar updated', avatar: fileUrl, user });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Change password
profilerouter.patch('/:id/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password || typeof user.password !== 'string' || !user.password.startsWith('$2')) {
      return res.status(400).json({ message: 'Invalid current password' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Upgrade to premium
profilerouter.patch('/:id/premium', async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Validate plan
    if (!plan || !['pro', 'annual'].includes(plan)) {
      return res.status(400).json({ message: 'Valid plan (pro or annual) is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isPremium: true },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      message: 'Successfully upgraded to premium!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        premium: user.isPremium,
        plan: plan
      }
    });
  } catch (err) {
    console.error('Premium upgrade error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Downgrade from premium (revoke premium status)
profilerouter.patch('/:id/downgrade', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isPremium: false },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      message: 'Successfully downgraded to basic plan.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        premium: user.isPremium,
        plan: null
      }
    });
  } catch (err) {
    console.error('Premium downgrade error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default profilerouter;