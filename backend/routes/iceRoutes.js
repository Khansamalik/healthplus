import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  ensureIceCode,
  rotateIceCode,
  getIcePublic,
  requestFullHistory,
  approveAccess,
} from '../Controllers/iceController.js';

const router = express.Router();

// Public endpoints by code
router.get('/public/:code', getIcePublic);
router.post('/public/:code/request-full', requestFullHistory);
router.get('/approve/:token', approveAccess);

// Authenticated management
router.use(authMiddleware);
router.post('/ensure', ensureIceCode);
router.post('/rotate', rotateIceCode);

export default router;
