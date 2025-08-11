import mongoose from 'mongoose';

const patientInfoSchema = new mongoose.Schema({
  name: { type: String },
  bloodGroup: { type: String },
  medicalHistory: { type: String },
  preferredHospital: { type: String },
  additionalComments: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
});

export default mongoose.model('PatientInfo', patientInfoSchema);
