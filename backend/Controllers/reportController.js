import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Report from '../models/Report.js';

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/heic',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

// Create (upload) a report
export const uploadReport = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { description, tags } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`; // served statically by express

    const report = await Report.create({
      userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      description: description || '',
      tags: tags ? (Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean)) : [],
      filePath: req.file.path,
      fileUrl,
    });

    res.status(201).json(report);
  } catch (err) {
    console.error('Upload report error:', err);
    res.status(500).json({ message: err.message || 'Failed to upload report' });
  }
};

// List reports for the logged-in user
export const listReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await Report.find({ userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single report (metadata)
export const getReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (String(report.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update report metadata
export const updateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { description, tags } = req.body;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (String(report.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' });

    report.description = description ?? report.description;
    if (typeof tags !== 'undefined') {
      report.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);
    }
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a report (and file)
export const deleteReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (String(report.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' });

    // Remove file from disk if present
    try {
      if (report.filePath && fs.existsSync(report.filePath)) {
        fs.unlinkSync(report.filePath);
      }
    } catch (e) {
      console.warn('Failed to remove file from disk:', e.message);
    }

    await report.deleteOne();
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Replace an existing report's file
export const replaceReportFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (String(report.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' });

    // Remove old file
    try {
      if (report.filePath && fs.existsSync(report.filePath)) {
        fs.unlinkSync(report.filePath);
      }
    } catch (e) {
      console.warn('Failed to remove old file from disk:', e.message);
    }

    // Update with new file info
    report.originalName = req.file.originalname;
    report.fileName = req.file.filename;
    report.mimeType = req.file.mimetype;
    report.size = req.file.size;
    report.filePath = req.file.path;
    report.fileUrl = `/uploads/${req.file.filename}`;
    await report.save();

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
