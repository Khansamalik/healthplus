import express from 'express';
import {
  recommendHospitals,
  getAllHospitals,
  getHospitalById
} from '../controllers/hospitalController.js';

const router = express.Router();

// Get all hospitals
router.get('/', getAllHospitals);

// Get hospital by ID
router.get('/:id', getHospitalById);

// Recommend hospitals based on medical condition
router.post('/recommend', recommendHospitals);

export default router;
