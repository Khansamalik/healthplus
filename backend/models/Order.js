import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['MEDICINE', 'LAB'], required: true },
  // Common
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },
  details: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
