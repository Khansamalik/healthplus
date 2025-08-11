import Hospital from '../models/Hospital.js';
import MedicalCondition from '../models/MedicalCondition.js';
import EmergencyAlert from '../models/EmergencyAlert.js';
import natural from 'natural';
import { analyzeMedicalCondition } from '../utils/medicalAnalyzer.js';

// Natural language processing tokenizer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Get all hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true });
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hospital by id
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recommend hospitals based on medical condition
export const recommendHospitals = async (req, res) => {
  try {
    const { condition, userLocation, userId } = req.body;
    
    if (!condition) {
      return res.status(400).json({ message: 'Medical condition is required' });
    }

    // Analyze the medical condition text
    const analysis = await analyzeMedicalCondition(condition);
    
    // Get all active hospitals
    const hospitals = await Hospital.find({ isActive: true });
    
    if (hospitals.length === 0) {
      return res.status(404).json({ message: 'No hospitals found' });
    }

    // Score each hospital based on the condition and requirements
    const scoredHospitals = hospitals.map(hospital => {
      let score = 0;
      
      // Base score - all hospitals start with a base score
      score += 50;
      
      // Score based on emergency capacity
      const capacityRatio = hospital.emergencyCapacity.available / hospital.emergencyCapacity.total;
      score += capacityRatio * 20; // More available capacity is better
      
      // Score based on required specialists
      if (analysis.requiredSpecialists && analysis.requiredSpecialists.length > 0) {
        const specialistMatch = hospital.doctors.filter(doctor => 
          analysis.requiredSpecialists.includes(doctor.specialization) && doctor.available
        );
        score += specialistMatch.length * 10;
      }
      
      // Score based on required equipment
      if (analysis.requiredEquipment && analysis.requiredEquipment.length > 0) {
        const equipmentMatch = hospital.equipment.filter(item => 
          analysis.requiredEquipment.includes(item.name) && item.available
        );
        score += equipmentMatch.length * 10;
      }
      
      // Score based on urgency level and capacity
      if (analysis.urgencyLevel === 'CRITICAL' && capacityRatio > 0.3) {
        score += 20;
      }
      
      // Score based on distance from user (if location provided)
      if (userLocation && userLocation.lat && userLocation.lng) {
        const distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          hospital.location.lat, 
          hospital.location.lng
        );
        
        // Closer hospitals get higher scores
        // Max 20 points for hospitals within 5km
        const distanceScore = Math.max(0, 20 - (distance / 5) * 20);
        score += distanceScore;
      }
      
      // Score based on hospital rating
      score += hospital.rating * 3;
      
      return {
        hospital,
        score,
        reason: generateRecommendationReason(hospital, analysis, capacityRatio)
      };
    });
    
    // Sort hospitals by score (descending)
    scoredHospitals.sort((a, b) => b.score - a.score);
    
    // Take top 3 recommendations
    const recommendations = scoredHospitals.slice(0, 3);
    
    // If userId is provided, save these recommendations
    if (userId) {
      const emergencyAlert = new EmergencyAlert({
        userId,
        alertType: 'MEDICAL_ASSISTANCE',
        description: condition,
        medicalCondition: analysis.conditionName || 'Unknown condition',
        location: userLocation,
        status: 'PENDING',
        recommendedHospitals: recommendations.map(rec => ({
          hospitalId: rec.hospital._id,
          score: rec.score,
          reason: rec.reason
        }))
      });
      
      await emergencyAlert.save();
    }
    
    res.status(200).json({
      recommendations: recommendations.map(rec => ({
        id: rec.hospital._id,
        name: rec.hospital.name,
        location: rec.hospital.location,
        contactNumber: rec.hospital.contactNumber,
        emergencyCapacity: rec.hospital.emergencyCapacity,
        score: rec.score,
        reason: rec.reason
      })),
      analysis
    });
    
  } catch (error) {
    console.error('Hospital recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

// Generate a human-readable reason for recommendation
function generateRecommendationReason(hospital, analysis, capacityRatio) {
  let reasons = [];
  
  // Capacity reason
  if (capacityRatio > 0.5) {
    reasons.push(`Good emergency capacity (${hospital.emergencyCapacity.available} beds available)`);
  } else if (capacityRatio > 0.2) {
    reasons.push(`Limited emergency capacity (${hospital.emergencyCapacity.available} beds available)`);
  } else {
    reasons.push(`Very limited emergency capacity (only ${hospital.emergencyCapacity.available} beds available)`);
  }
  
  // Specialist reason
  if (analysis.requiredSpecialists && analysis.requiredSpecialists.length > 0) {
    const specialistMatch = hospital.doctors.filter(doctor => 
      analysis.requiredSpecialists.includes(doctor.specialization) && doctor.available
    );
    
    if (specialistMatch.length > 0) {
      const specialistNames = specialistMatch.map(doc => doc.specialization).join(', ');
      reasons.push(`Has required specialists: ${specialistNames}`);
    }
  }
  
  // Equipment reason
  if (analysis.requiredEquipment && analysis.requiredEquipment.length > 0) {
    const equipmentMatch = hospital.equipment.filter(item => 
      analysis.requiredEquipment.includes(item.name) && item.available
    );
    
    if (equipmentMatch.length > 0) {
      const equipmentNames = equipmentMatch.map(item => item.name).join(', ');
      reasons.push(`Has necessary equipment: ${equipmentNames}`);
    }
  }
  
  if (reasons.length === 0) {
    return "General emergency care available";
  }
  
  return reasons.join('. ');
}
