import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alertType: {
    type: String,
    enum: ['AMBULANCE', 'MEDICAL_ASSISTANCE', 'CONTACT_NOTIFICATION'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  medicalCondition: {
    type: String
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  serviceProvider: {
    type: String // ambulance service name or hospital name
  },
  notifiedContacts: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyContact'
    },
    notifiedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'READ'],
      default: 'SENT'
    }
  }],
  recommendedHospitals: [{
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    score: {
      type: Number
    },
    reason: {
      type: String
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('EmergencyAlert', emergencyAlertSchema);
