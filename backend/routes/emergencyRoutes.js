// backend/routes/emergencyRoutes.js

import express from 'express';
import {
  // Emergency contacts
  createContact,
  getUserContacts,
  updateContact,
  deleteContact,
  
  // Preferred services
  createService,
  getUserServices,
  deleteService,
  
  // Patient info
  updatePatientInfo,
  getPatientInfo,
  
  // Complete data
  getAllEmergencyData
} from '../controllers/emergencyContactController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Emergency contacts routes
router.post('/contacts', createContact);
router.get('/contacts', getUserContacts);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

// Preferred services routes
router.post('/services', createService);
router.get('/services', getUserServices);
router.delete('/services/:id', deleteService);

// Patient info routes
router.put('/patient-info', updatePatientInfo);
router.get('/patient-info', getPatientInfo);

// Complete data route
router.get('/all', getAllEmergencyData);

export default router;
