import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hospital from './models/Hospital.js';
import MedicalCondition from './models/MedicalCondition.js';

dotenv.config();

// Dummy hospital data
const dummyHospitals = [
  {
    name: 'City General Hospital',
    location: {
      lat: 24.8607,
      lng: 67.0011,
      address: '123 Main Street, Karachi'
    },
    specialties: ['Cardiology', 'Trauma', 'Neurology', 'Pediatrics'],
    emergencyCapacity: {
      total: 50,
      available: 15
    },
    doctors: [
      { name: 'Dr. Ahmed Khan', specialization: 'Cardiologist', available: true },
      { name: 'Dr. Fatima Ali', specialization: 'Emergency Medicine Specialist', available: true },
      { name: 'Dr. Imran Shah', specialization: 'Neurologist', available: true },
      { name: 'Dr. Saima Malik', specialization: 'Pediatrician', available: false }
    ],
    equipment: [
      { name: 'ECG machine', available: true },
      { name: 'CT scanner', available: true },
      { name: 'MRI machine', available: true },
      { name: 'Ventilator', available: true },
      { name: 'Defibrillator', available: true }
    ],
    contactNumber: '+92-21-1234567',
    email: 'info@citygeneral.com',
    rating: 4.2,
    isActive: true
  },
  {
    name: 'South Medical Center',
    location: {
      lat: 24.8506,
      lng: 67.0054,
      address: '456 Hospital Road, Clifton, Karachi'
    },
    specialties: ['Orthopedics', 'Emergency Medicine', 'Surgery', 'Obstetrics'],
    emergencyCapacity: {
      total: 30,
      available: 5
    },
    doctors: [
      { name: 'Dr. Zainab Hassan', specialization: 'Orthopedic Surgeon', available: true },
      { name: 'Dr. Adil Raza', specialization: 'Emergency Medicine Specialist', available: true },
      { name: 'Dr. Sana Khan', specialization: 'General Surgeon', available: true },
      { name: 'Dr. Tariq Siddiqui', specialization: 'Obstetrician', available: true }
    ],
    equipment: [
      { name: 'X-ray machine', available: true },
      { name: 'Ultrasound machine', available: true },
      { name: 'Surgical tools', available: true },
      { name: 'Fetal monitor', available: true },
      { name: 'Cast materials', available: true }
    ],
    contactNumber: '+92-21-9876543',
    email: 'contact@southmedical.com',
    rating: 4.0,
    isActive: true
  },
  {
    name: 'North Specialty Hospital',
    location: {
      lat: 24.9200,
      lng: 67.0300,
      address: '789 Healthcare Avenue, North Nazimabad, Karachi'
    },
    specialties: ['Pulmonology', 'Gastroenterology', 'Cardiology', 'Dermatology'],
    emergencyCapacity: {
      total: 40,
      available: 25
    },
    doctors: [
      { name: 'Dr. Bilal Ahmed', specialization: 'Pulmonologist', available: true },
      { name: 'Dr. Nadia Iqbal', specialization: 'Gastroenterologist', available: true },
      { name: 'Dr. Kashif Mirza', specialization: 'Cardiologist', available: false },
      { name: 'Dr. Asma Zubair', specialization: 'Emergency Medicine Specialist', available: true }
    ],
    equipment: [
      { name: 'Nebulizer', available: true },
      { name: 'Oxygen supply', available: true },
      { name: 'Ventilator', available: true },
      { name: 'Endoscope', available: true },
      { name: 'ECG machine', available: true }
    ],
    contactNumber: '+92-21-5556677',
    email: 'help@northspecialty.com',
    rating: 4.5,
    isActive: true
  }
];

// Dummy medical conditions
const dummyMedicalConditions = [
  {
    name: 'Heart Attack',
    description: 'A blockage of blood flow to the heart muscle',
    symptoms: ['chest pain', 'shortness of breath', 'nausea', 'cold sweat', 'fatigue'],
    urgency: 'CRITICAL',
    specialistTypes: ['Cardiologist', 'Emergency Medicine Specialist'],
    requiredEquipment: ['ECG machine', 'defibrillator', 'cardiac monitor', 'oxygen supply']
  },
  {
    name: 'Broken Bone',
    description: 'A fracture in one or more bones',
    symptoms: ['pain', 'swelling', 'deformity', 'difficulty moving'],
    urgency: 'HIGH',
    specialistTypes: ['Orthopedic Surgeon', 'Emergency Medicine Specialist'],
    requiredEquipment: ['X-ray machine', 'CT scanner', 'casting materials']
  },
  {
    name: 'Asthma Attack',
    description: 'A sudden worsening of asthma symptoms',
    symptoms: ['wheezing', 'coughing', 'shortness of breath', 'chest tightness'],
    urgency: 'HIGH',
    specialistTypes: ['Pulmonologist', 'Emergency Medicine Specialist'],
    requiredEquipment: ['nebulizer', 'oxygen supply', 'ventilator']
  },
  {
    name: 'Allergic Reaction',
    description: 'An overreaction of the immune system to a substance',
    symptoms: ['rash', 'hives', 'swelling', 'difficulty breathing', 'itching'],
    urgency: 'HIGH',
    specialistTypes: ['Allergist', 'Emergency Medicine Specialist'],
    requiredEquipment: ['epinephrine auto-injector', 'antihistamines', 'oxygen supply']
  },
  {
    name: 'Food Poisoning',
    description: 'Illness caused by consuming contaminated food',
    symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
    urgency: 'MEDIUM',
    specialistTypes: ['Gastroenterologist', 'Emergency Medicine Specialist'],
    requiredEquipment: ['IV fluids', 'anti-nausea medication']
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');
  
  try {
    //  existing data clear
    await Hospital.deleteMany({});
    console.log('Cleared hospitals collection');
    
    await MedicalCondition.deleteMany({});
    console.log('Cleared medical conditions collection');
    
    // Insert dummy hospitals
    const hospitals = await Hospital.insertMany(dummyHospitals);
    console.log(`✅ Added ${hospitals.length} hospitals`);
    
    // Insert dummy medical conditions
    const conditions = await MedicalCondition.insertMany(dummyMedicalConditions);
    console.log(`✅ Added ${conditions.length} medical conditions`);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
