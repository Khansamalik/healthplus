import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createNotification,
  listMyNotifications,
  markRead,
  markAllRead,
  removeNotification,
  seedDemo,
} from '../Controllers/notificationController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listMyNotifications);
router.post('/', createNotification); // optional admin/system use
router.post('/seed', seedDemo); // convenient demo
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);
router.delete('/:id', removeNotification);

export default router;
