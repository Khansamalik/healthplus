import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    const { type, details } = req.body;
    if (!type) return res.status(400).json({ message: 'type is required' });
    const order = await Order.create({ userId: req.user?.id, type, details });
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
