import mongoose from 'mongoose';

const medicalConditionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  symptoms: [{
    type: String
  }],
  urgency: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  specialistTypes: [{
    type: String
  }],
  requiredEquipment: [{
    type: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('MedicalCondition', medicalConditionSchema);
