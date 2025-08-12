import Notification from '../models/Notification.js';

// Create a notification (for future system events)
export const createNotification = async (req, res) => {
  try {
    const { user, type = 'INFO', title, message, metadata } = req.body;
    const n = await Notification.create({ user, type, title, message, metadata });
    res.status(201).json(n);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create notification' });
  }
};

// List notifications for the authenticated user
export const listMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const items = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(200);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
export const markRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const item = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update' });
  }
};

// Mark all as read
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update' });
  }
};

// Delete one
export const removeNotification = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const r = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete' });
  }
};

// Seed some demo notifications for a user
export const seedDemo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const demo = [
      { user: userId, type: 'INFO', title: 'Welcome to SehatPlus', message: 'Thanks for joining! Explore features to get started.' },
      { user: userId, type: 'REMINDER', title: 'Update your profile', message: 'Complete your profile for better recommendations.' },
      { user: userId, type: 'BILLING', title: 'Subscription Active', message: 'Your Pro Care plan is active.' },
    ];
    await Notification.insertMany(demo);
    res.json({ message: 'Seeded' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to seed' });
  }
};
