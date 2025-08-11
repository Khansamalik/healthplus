import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  uploadMiddleware,
  uploadReport,
  listReports,
  getReport,
  updateReport,
  deleteReport,
  replaceReportFile,
} from '../Controllers/reportController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', uploadMiddleware.single('file'), uploadReport); // multipart/form-data
router.get('/', listReports);
router.get('/:id', getReport);
router.put('/:id', updateReport);
router.put('/:id/file', uploadMiddleware.single('file'), replaceReportFile);
router.delete('/:id', deleteReport);

export default router;
