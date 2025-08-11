import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Get address from coordinates using reverse geocoding
        getAddressFromCoordinates(location.lat, location.lng)
          .then(address => {
            resolve({
              ...location,
              address
            });
          })
          .catch(error => {
            // Still resolve with coordinates even if address lookup fails
            console.error('Error getting address:', error);
            resolve(location);
          });
      },
      error => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
};

// Get address from coordinates using a geocoding API
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    // For demo purposes, return a dummy address
    // In a real application, you would use a geocoding service like Google Maps API
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    
    // Example of using Google Maps API (would require API key)
    /*
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_API_KEY`
    );
    
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }
    */
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  }
};

// Get recommended hospitals based on medical condition
export const getHospitalRecommendations = async (condition, location, userId) => {
  try {
    const response = await axios.post(`${API_URL}/hospitals/recommend`, {
      condition,
      userLocation: location,
      userId
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting hospital recommendations:', error);
    throw error;
  }
};

// Send emergency alert
export const sendEmergencyAlert = async (alertData) => {
  try {
    const response = await axios.post(`${API_URL}/alerts`, alertData);
    return response.data;
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    throw error;
  }
};

// Notify emergency contacts
export const notifyEmergencyContacts = async (userId, message, location) => {
  try {
    const response = await axios.post(`${API_URL}/alerts`, {
      userId,
      alertType: 'CONTACT_NOTIFICATION',
      description: message,
      location
    });
    
    return response.data;
  } catch (error) {
    console.error('Error notifying emergency contacts:', error);
    throw error;
  }
};

// Request ambulance
export const requestAmbulance = async (userId, serviceProvider, message, location) => {
  try {
    const response = await axios.post(`${API_URL}/alerts`, {
      userId,
      alertType: 'AMBULANCE',
      description: message,
      location,
      serviceProvider
    });
    
    return response.data;
  } catch (error) {
    console.error('Error requesting ambulance:', error);
    throw error;
  }
};
