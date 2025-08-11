// hospitalData.js
import axios from 'axios';

// Function to fetch hospital data from Pakistan hospitals dataset
export const fetchHospitalData = async () => {
  try {
    // In a production environment, this would be a call to your backend API
    // that accesses the Pakistan hospitals dataset
    // For now, we'll use mock data based on the Pakistan hospitals dataset
    
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Sample data from Pakistan hospitals dataset
  return [
      {
        id: 'hosp1',
        name: 'Aga Khan University Hospital',
        location: {
          lat: 24.8861,
          lng: 67.0741,
          address: 'Stadium Road, Karachi, Sindh'
        },
        contactNumber: '+92-21-111-911-911',
        emergencyCapacity: {
          total: 50,
          available: 15,
          doctors: 8,
          equipment: 'Advanced ICU, MRI, CT Scan, Cardiac Cath Lab'
        },
        specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine']
      },
      {
        id: 'hosp2',
        name: 'Shifa International Hospital',
        location: {
          lat: 33.6844,
          lng: 73.0479,
          address: 'Sector H-8/4, Islamabad'
        },
        contactNumber: '+92-51-8464646',
        emergencyCapacity: {
          total: 40,
          available: 12,
          doctors: 6,
          equipment: 'ICU, CT Scan, X-Ray, Emergency Ventilators'
        },
        specialties: ['Cardiology', 'Oncology', 'Emergency Medicine']
      },
      {
        id: 'hosp2b',
        name: 'Maroof International Hospital',
        location: {
          lat: 33.7215,
          lng: 73.0542,
          address: 'F-10 Markaz, Islamabad'
        },
        contactNumber: '+92-51-111-644-911',
        emergencyCapacity: {
          total: 30,
          available: 9,
          doctors: 5,
          equipment: 'ICU, CT Scan, X-Ray, Emergency Ward'
        },
        specialties: ['Emergency Medicine', 'Cardiology', 'Surgery']
      },
      {
        id: 'hosp2c',
        name: 'Kulsum International Hospital',
        location: {
          lat: 33.7169,
          lng: 73.0654,
          address: 'Blue Area, Islamabad'
        },
        contactNumber: '+92-51-8446666',
        emergencyCapacity: {
          total: 28,
          available: 8,
          doctors: 4,
          equipment: 'ICU, Emergency Ward, X-Ray'
        },
        specialties: ['Emergency Medicine', 'Cardiology']
      },
      {
        id: 'hosp3',
        name: 'Jinnah Postgraduate Medical Centre',
        location: {
          lat: 24.8600,
          lng: 67.0100,
          address: 'Rafiqui Shaheed Road, Karachi'
        },
        contactNumber: '+92-21-99201300',
        emergencyCapacity: {
          total: 60,
          available: 25,
          doctors: 12,
          equipment: 'Trauma Center, ICU, CT Scan, MRI, Emergency OR'
        },
        specialties: ['Emergency Medicine', 'Surgery', 'Internal Medicine']
      },
      {
        id: 'hosp4',
        name: 'Services Hospital Lahore',
        location: {
          lat: 31.5383,
          lng: 74.3264,
          address: 'Jail Road, Lahore'
        },
        contactNumber: '+92-42-99203402',
        emergencyCapacity: {
          total: 45,
          available: 18,
          doctors: 9,
          equipment: 'ICU, Emergency Ward, X-Ray, Basic Surgery'
        },
        specialties: ['Emergency Medicine', 'Cardiology', 'Pediatrics']
      },
      {
        id: 'hosp5',
        name: 'Pakistan Institute of Medical Sciences',
        location: {
          lat: 33.6939,
          lng: 73.0551,
          address: 'G-8/3, Islamabad'
        },
        contactNumber: '+92-51-9261170',
        emergencyCapacity: {
          total: 55,
          available: 20,
          doctors: 10,
          equipment: 'ICU, CT Scan, MRI, Emergency OR'
        },
        specialties: ['Emergency Medicine', 'Surgery', 'Neurology']
      },
      {
        id: 'hosp6',
        name: 'Holy Family Hospital',
        location: {
          lat: 33.6494,
          lng: 73.0703,
          address: 'Satellite Town, Rawalpindi'
        },
        contactNumber: '+92-51-9290319',
        emergencyCapacity: {
          total: 35,
          available: 10,
          doctors: 6,
          equipment: 'Emergency Ward, ICU, X-Ray'
        },
        specialties: ['Emergency Medicine', 'Gynecology', 'Pediatrics']
      },
      {
        id: 'clinic1',
        name: '24/7 Emergency Clinic Saddar',
        location: {
          lat: 33.5946,
          lng: 73.0551,
          address: 'Saddar, Rawalpindi'
        },
        contactNumber: '+92-51-0000000',
        emergencyCapacity: {
          total: 12,
          available: 4,
          doctors: 2,
          equipment: 'Emergency Ward, X-Ray'
        },
        specialties: ['Emergency Medicine']
      },
      {
        id: 'clinic2',
        name: 'Private ER Clinic G-10',
        location: {
          lat: 33.6896,
          lng: 73.0221,
          address: 'G-10 Markaz, Islamabad'
        },
        contactNumber: '+92-51-0000001',
        emergencyCapacity: {
          total: 10,
          available: 3,
          doctors: 2,
          equipment: 'Emergency Ward'
        },
        specialties: ['Emergency Medicine']
      },
      {
        id: 'hosp7',
        name: 'Liaquat National Hospital',
        location: {
          lat: 24.8822,
          lng: 67.0674,
          address: 'National Stadium Road, Karachi'
        },
        contactNumber: '+92-21-111-456-456',
        emergencyCapacity: {
          total: 42,
          available: 14
        },
        specialties: ['Emergency Medicine', 'Cardiology', 'Neurosurgery']
      },
      {
        id: 'hosp8',
        name: 'Mayo Hospital',
        location: {
          lat: 31.5640,
          lng: 74.3054,
          address: 'Outfall Road, Lahore'
        },
        contactNumber: '+92-42-99211100',
        emergencyCapacity: {
          total: 65,
          available: 22
        },
        specialties: ['Emergency Medicine', 'Surgery', 'Burn Unit']
      }
    ];
  } catch (error) {
    console.error('Error fetching hospital data:', error);
    throw error;
  }
};

// Function to find nearest hospitals based on user location and medical condition
export const findNearestHospitals = (hospitals, userLocation, condition, limit = 4, options = {}) => {
  if (!hospitals || hospitals.length === 0) {
    return [];
  }

  // Default to Islamabad if user location is not available
  const defaultLocation = { lat: 33.6844, lng: 73.0479 };
  const location = userLocation || defaultLocation;

  const { maxDistanceKm = 30, minBeds = 1, minDoctors = 1, requireEmergency = true } = options;

  // Calculate distance using Haversine formula (accurate for geographical distances)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  /**
   * Calculate a recommendation score based on distance, emergency capacity, and condition relevance
   * @param {Object} hospital - Hospital data
   * @param {number} distance - Distance to hospital in kilometers
   * @param {string} condition - Patient's medical condition
   * @returns {number} Recommendation score (0-100)
   */
  const calculateScore = (hospital, distance, condition) => {
    // Base factors for scoring - prioritize distance heavily
    const distanceFactor = Math.max(0, 100 - (distance * 8)); // Increased distance penalty
    const totalBeds = hospital.emergencyCapacity?.total || 0;
    const availableBeds = hospital.emergencyCapacity?.available || 0;
    const doctors = hospital.emergencyCapacity?.doctors || 0;
    const capacityFactor = totalBeds > 0 ? (availableBeds / totalBeds) * 100 : 0;
    const doctorFactor = doctors * 5; // Doctor availability bonus
    
    // Specialty matching bonus
    let specialtyBonus = 0;
    if (condition) {
      const conditionLower = condition.toLowerCase();
      if (conditionLower.includes('cardiac') || conditionLower.includes('heart')) {
        specialtyBonus = hospital.specialties.includes('Cardiology') ? 20 : 0;
      } else if (conditionLower.includes('breathing') || conditionLower.includes('respiratory')) {
        specialtyBonus = hospital.specialties.includes('Pulmonology') ? 20 : 0;
      } else if (conditionLower.includes('neuro') || conditionLower.includes('brain')) {
        specialtyBonus = hospital.specialties.includes('Neurology') ? 20 : 0;
      } else if (conditionLower.includes('trauma') || conditionLower.includes('injury')) {
        specialtyBonus = hospital.specialties.includes('Emergency Medicine') ? 20 : 0;
      } else if (conditionLower.includes('stroke')) {
        specialtyBonus = hospital.specialties.includes('Neurology') ? 20 : 0;
      }
    }
    
    // Calculate total score - distance is most important (60%), then capacity (20%), doctors (10%), specialty (10%)
    const totalScore = (distanceFactor * 0.6) + (capacityFactor * 0.2) + (doctorFactor * 0.1) + (specialtyBonus * 0.1);
    
    return Math.min(100, Math.round(totalScore));
  };

  /**
   * Generate a recommendation reason based on hospital features and distance
   * @param {Object} hospital - Hospital data
   * @param {number} distance - Distance to hospital in kilometers
   * @param {string} condition - Patient's medical condition
   * @returns {string} Recommendation reason
   */
  const generateReason = (hospital, distance, condition) => {
    let reasons = [];
    
    // Distance-based reason (most important)
    if (distance < 2) {
      reasons.push("Very close - under 2km");
    } else if (distance < 5) {
      reasons.push(`Close proximity - ${Math.round(distance * 10) / 10} km away`);
    } else if (distance < 10) {
      reasons.push(`Reasonable distance - ${Math.round(distance * 10) / 10} km away`);
    } else {
      reasons.push(`${Math.round(distance * 10) / 10} km from your location`);
    }
    
    // Availability information
    const totalBeds = hospital.emergencyCapacity?.total || 0;
    const availableBeds = hospital.emergencyCapacity?.available || 0;
    const doctors = hospital.emergencyCapacity?.doctors || 0;
    const availabilityPercentage = totalBeds > 0 ? (availableBeds / totalBeds) * 100 : 0;
    if (availabilityPercentage > 40) {
      reasons.push(`Good availability: ${availableBeds} beds, ${doctors} doctors`);
    } else if (availabilityPercentage > 20) {
      reasons.push(`Moderate availability: ${availableBeds} beds, ${doctors} doctors`);
    } else {
      reasons.push(`Limited availability: ${availableBeds} beds, ${doctors} doctors`);
    }
    
    // Equipment information
    if (hospital.emergencyCapacity.equipment) {
      const equipmentList = hospital.emergencyCapacity.equipment.split(', ').slice(0, 2); // Show first 2 equipment types
      reasons.push(`Equipment: ${equipmentList.join(', ')}`);
    }
    
    return reasons.join(". ") + ".";
  };

  try {
    // Compute distance, then filter by proximity and capability, then score
    const withDistance = hospitals.map(hospital => {
      const distance = getDistance(
        location.lat, 
        location.lng, 
        hospital.location.lat, 
        hospital.location.lng
      );
      return { ...hospital, distance: parseFloat(distance.toFixed(1)) };
    });

    // Filter: within radius and meets minimum capabilities
    const filtered = withDistance.filter(h => {
      const withinRadius = h.distance <= maxDistanceKm;
      const totalBeds = h.emergencyCapacity?.total || 0;
      const availableBeds = h.emergencyCapacity?.available || 0;
      const doctors = h.emergencyCapacity?.doctors || 0;
      const hasEmergency = !requireEmergency || h.specialties?.includes('Emergency Medicine') || (h.emergencyCapacity?.equipment || '').toLowerCase().includes('emergency') || (h.emergencyCapacity?.equipment || '').toLowerCase().includes('icu');
      const meetsCap = availableBeds >= minBeds && doctors >= minDoctors && hasEmergency;
      return withinRadius && meetsCap;
    });

    // Now score and add reasons
    const hospitalsWithScores = filtered.map(h => ({
      ...h,
      score: calculateScore(h, h.distance, condition),
      reason: generateReason(h, h.distance, condition)
    }));

    // Sort by distance first (most important), then by score
    return hospitalsWithScores
      .sort((a, b) => {
        // First sort by distance (ascending - closest first)
        if (Math.abs(a.distance - b.distance) > 0.5) {
          return a.distance - b.distance;
        }
        // If distances are similar (within 0.5km), then sort by score
        return b.score - a.score;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error finding nearest hospitals:', error);
    return [];
  }
};
