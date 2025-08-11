import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String, required: true }
});

const hospitalSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  location: { 
    type: locationSchema, 
    required: true 
  },
  specialties: [{ 
    type: String 
  }],
  emergencyCapacity: {
    total: { type: Number, required: true },
    available: { type: Number, required: true }
  },
  doctors: [{
    name: { type: String },
    specialization: { type: String },
    available: { type: Boolean, default: true }
  }],
  equipment: [{
    name: { type: String },
    available: { type: Boolean, default: true }
  }],
  contactNumber: { 
    type: String 
  },
  email: { 
    type: String 
  },
  rating: { 
    type: Number, 
    min: 0, 
    max: 5, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

export default mongoose.model('Hospital', hospitalSchema);
