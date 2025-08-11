import mongoose from 'mongoose';

const preferredServiceSchema = new mongoose.Schema({
  hospital: { type: String },
  ambulance: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
});

export default mongoose.model('PreferredService', preferredServiceSchema);
