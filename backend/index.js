// index.js

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Import routes
import authRoutes from './routes/authroute.js';
import profileRoutes from './routes/profiteroute.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import userRoutes from './routes/userRouter.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import iceRoutes from './routes/iceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// uploaded files statically serve krega
app.use('/uploads', express.static(path.resolve('uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Backend is working!');
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ice', iceRoutes);
app.use('/api/notifications', notificationRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
