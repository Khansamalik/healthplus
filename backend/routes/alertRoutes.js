import express from 'express';
import {
  createEmergencyAlert,
  getAlertById,
  getUserAlerts,
  updateAlertStatus
} from '../controllers/alertController.js';

const router = express.Router();

// Create new emergency alert
router.post('/', createEmergencyAlert);

// Get alert by ID
router.get('/:id', getAlertById);

// Get all alerts for a user
router.get('/user/:userId', getUserAlerts);

// Update alert status
router.put('/:id/status', updateAlertStatus);

export default router;
