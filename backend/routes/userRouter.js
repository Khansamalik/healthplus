// routes/userroute.js

import express from 'express';
import {
  createUser,
  getAllUsers,
  addToCart,
  getCart,
  setPharmacy,
  getPharmacy
} from '../controllers/userController.js';

const router = express.Router();

// User Routes
router.post('/', createUser);
router.get('/', getAllUsers);

// Cart Routes
router.post('/cart', addToCart);          // Add item to cart
router.get('/cart/:id', getCart);         // View cart by user ID

// Pharmacy Routes
router.post('/pharmacy', setPharmacy);    // Add/update pharmacy info
router.get('/pharmacy/:id', getPharmacy); // Get pharmacy info by user ID

export default router;
