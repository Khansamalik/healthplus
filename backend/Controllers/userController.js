import User from '../models/user.js';

// Create new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, isPremium } = req.body;
    const user = new User({ name, email, password, isPremium });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add medicine to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, medicine } = req.body;
    const user = await User.findById(userId);
    user.cart.push(medicine);
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// View cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user.cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add pharmacy info
export const setPharmacy = async (req, res) => {
  try {
    const { userId, pharmacy } = req.body;
    const user = await User.findById(userId);
    user.pharmacy = pharmacy;
    await user.save();
    res.json(user.pharmacy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get pharmacy info
export const getPharmacy = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user.pharmacy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
