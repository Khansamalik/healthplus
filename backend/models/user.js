import mongoose from 'mongoose';

// Embedded medicine schema inside user
const medicineSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
});

// Main user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cnic: {
    type: String,
    required: true,
    unique: true
  },
  contact: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true    
  },
  avatar: {
    type: String,
  },
  password: {
    type: String
  },
  isPremium: {
    type: Boolean,
    default: false
  },

  // Cart for medicine orders
  cart: [medicineSchema],

  // Optional: user’s preferred pharmacy (embedded)
  pharmacy: {
    name: String,
    location: String,
    contact: String,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
