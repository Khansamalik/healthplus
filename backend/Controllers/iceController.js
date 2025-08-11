import crypto from 'crypto';
import IceShare from '../models/IceShare.js';
import EmergencyContact from '../models/EmergencyContact.js';
import PreferredService from '../models/PreferredService.js';
import PatientInfo from '../models/PatientInfo.js';
import { sendSMS, sendEmail } from '../utils/notificationService.js';

const genCode = () => crypto.randomBytes(6).toString('hex');

// Create or regenerate ICE public code for a user
export const ensureIceCode = async (req, res) => {
  const userId = req.user.id;
  let entry = await IceShare.findOne({ userId });
  if (!entry) {
    entry = await IceShare.create({ userId, code: genCode(), active: true });
  }
  return res.json(entry);
};

// Rotate code
export const rotateIceCode = async (req, res) => {
  const userId = req.user.id;
  const entry = await IceShare.findOneAndUpdate(
    { userId },
    { code: genCode(), active: true },
    { new: true, upsert: true }
  );
  return res.json(entry);
};

// Public: minimal ICE data by code
export const getIcePublic = async (req, res) => {
  const { code } = req.params;
  const entry = await IceShare.findOne({ code, active: true });
  if (!entry) return res.status(404).json({ message: 'ICE code not found' });
  const [contacts, patient] = await Promise.all([
    EmergencyContact.find({ userId: entry.userId }).select('name number'),
    PatientInfo.findOne({ userId: entry.userId }).select('name bloodGroup medicalHistory preferredHospital additionalComments'),
  ]);
  return res.json({ patientInfo: patient || {}, contacts: contacts || [] });
};

// Public: request full history by code (sends approvals to emergency contacts)
export const requestFullHistory = async (req, res) => {
  const { code } = req.params;
  const { requester } = req.body; // { name, phone/email }
  const entry = await IceShare.findOne({ code, active: true });
  if (!entry) return res.status(404).json({ message: 'ICE code not found' });
  const contacts = await EmergencyContact.find({ userId: entry.userId });
  if (!contacts.length) return res.status(400).json({ message: 'No emergency contacts to approve' });

  const approvalToken = genCode();
  const approvalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/approve-access/${approvalToken}`;

  // In a real app: store token with TTL here we store in-memory via process var or could extend model
  globalThis.__iceApprovals = globalThis.__iceApprovals || new Map();
  globalThis.__iceApprovals.set(approvalToken, { userId: entry.userId, createdAt: Date.now() });

  const message = `Request to access full medical history for a loved one. Approve: ${approvalUrl}`;
  await Promise.all(
    contacts.map(async c => {
      if (c.number) await sendSMS(c.number, message);
      // If emails existed, could sendEmail as well
    })
  );
  return res.json({ status: 'pending', approvalToken });
};

// Public: check approval token and return full history if approved (mock approval flow)
export const approveAccess = async (req, res) => {
  const { token } = req.params; // approval token
  const approvals = globalThis.__iceApprovals || new Map();
  const data = approvals.get(token);
  if (!data) return res.status(404).json({ message: 'Invalid or expired token' });
  // For demo, auto-approve when this endpoint is hit
  approvals.delete(token);
  const [contacts, services, patient] = await Promise.all([
    EmergencyContact.find({ userId: data.userId }),
    PreferredService.find({ userId: data.userId }),
    PatientInfo.findOne({ userId: data.userId }),
  ]);
  return res.json({ contacts, services, patientInfo: patient || {} });
};
