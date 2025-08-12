import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  type: { type: String, enum: ['INFO', 'ALERT', 'REMINDER', 'BILLING'], default: 'INFO' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  metadata: { type: Object },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
