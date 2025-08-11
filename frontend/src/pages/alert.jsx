import React, { useState, useEffect } from "react";
import { Phone, Mic, MapPin, Ambulance, Send, AlertTriangle, HeartPulse, Stethoscope, Loader, X, Check } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HospitalRecommendation from '../components/HospitalRecommendation';
import ConditionAnalysis from '../components/ConditionAnalysis';
import { getCurrentLocation, sendEmergencyAlert, notifyEmergencyContacts, requestAmbulance } from '../utils/emergencyService';
import { fetchHospitalData, findNearestHospitals } from '../utils/hospitalData';
import { fetchAllEmergencyData } from '../api/emergency';
import { useEmergencyData } from '../context/EmergencyDataContext.jsx';
import { openWhatsAppOrCall } from '../utils/phone';
import { analyzeSymptoms } from '../utils/symptomChecker';

export default function Alert() {
  const [emergencyText, setEmergencyText] = useState("");
  const [conditionText, setConditionText] = useState("");
  const [selectedService, setSelectedService] = useState("1122");
  const { contacts: emergencyContacts, preferredHospitalName, preferredAmbulance, refresh } = useEmergencyData();
  const preferredHospital = preferredHospitalName || '';
  const { isPremium, premiumPlan } = useAuth();
  const navigate = useNavigate();
  
  // State for hospital recommendations
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [hospitalRecommendations, setHospitalRecommendations] = useState(null);
  const [conditionAnalysis, setConditionAnalysis] = useState(null);
  const [showHospitalPopup, setShowHospitalPopup] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [contactsNotified, setContactsNotified] = useState(false);
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  const [preferredHospitalObj, setPreferredHospitalObj] = useState(null);

  // Load emergency data from backend (with localStorage fallbacks)
  useEffect(() => {
    // Ensure data is fresh and get user location
    refresh();
    handleGetLocation();
  }, []);
  
  const ambulanceServices = ["1122", "Edhi", "Chhipa", "Alkhidmat"];

  const handleMicInput = (setText) => {
    console.log("Voice input would activate here");
    setText("Sample voice input text"); // Mock implementation
  };

  // Get user's current location
  const handleGetLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await getCurrentLocation();
      setUserLocation(location);
      console.log("User location:", location);
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Unable to get your location. Please enable location services or enter manually.");
    } finally {
      setIsLoadingLocation(false);
    }
  };
  
  // Send emergency alert for ambulance
  const handleSendAlert = async () => {
    if (!emergencyText.trim()) {
      alert("Please describe your emergency");
      return;
    }
    
    try {
      if (!userLocation) {
        await handleGetLocation();
      }
      
      // For demo purposes, we'll just the API call
      // In a real app, this would call the backend API
      /*
      const response = await requestAmbulance(
        "user123", // Replace with actual user ID
        selectedService,
        emergencyText,
        userLocation
      );
      */
      
      // Simulate success
      setAmbulanceRequested(true);
      alert(`Emergency alert sent to ${selectedService}!\nMessage: ${emergencyText}`);
      setEmergencyText("");
    } catch (error) {
      console.error("Error sending alert:", error);
      alert("Failed to send emergency alert. Please try again.");
    }
  };
  
  // Get hospital recommendations based on medical condition
  const handleSendCondition = async () => {
    if (!conditionText.trim()) {
      alert("Please describe your medical condition");
      return;
    }
    
    setIsLoadingHospitals(true);
    setShowHospitalPopup(false);
    
    try {
      // Get user location if not already available
      if (!userLocation) {
        try {
          await handleGetLocation();
        } catch (error) {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Using Islamabad as default location.");
          // Use a default location if unable to get user's location
          setUserLocation({
            lat: 33.6844,
            lng: 73.0479,
            address: "Islamabad, Pakistan"
          });
        }
      }
      
      console.log("Analyzing symptoms:", conditionText);
      
      // Get condition analysis using symptom checker
      const analysis = await analyzeSymptoms(conditionText);
      console.log("Analysis result:", analysis);
      setConditionAnalysis(analysis);
      
  // Get hospital data 
  const hospitalData = await fetchHospitalData();
      console.log("Hospital data:", hospitalData);
      
      // Make sure we have a location to work with
      const locationToUse = userLocation || {
        lat: 33.6844,
        lng: 73.0479,
        address: "Islamabad, Pakistan"
      };
      
      // Find nearest hospitals based on user location and condition
      // Pass the condition to findNearestHospitals to consider specialties
      let nearestHospitals = findNearestHospitals(
        hospitalData, 
        locationToUse,
        analysis.primaryCondition || conditionText, // Use the analyzed condition or raw text
        4, // Show top 4 hospitals only
        { maxDistanceKm: 25, minBeds: 1, minDoctors: 1, requireEmergency: true }
      );
      // If user has a preferred hospital, try to promote it to the top when in range
      let preferred = null;
      if (preferredHospital && preferredHospital !== 'Not specified') {
        preferred = hospitalData.find(h => (h.name || '').toLowerCase().includes(preferredHospital.toLowerCase()));
      }
      if (preferred) {
        setPreferredHospitalObj(preferred);
        // If it's not already in the list and within 25km, add enriched version to front
        const already = nearestHospitals.find(h => h.id === preferred.id);
        if (!already) {
          const ph = findNearestHospitals([preferred], locationToUse, '', 1, { maxDistanceKm: 25, minBeds: 0, minDoctors: 0, requireEmergency: false });
          if (ph.length > 0) {
            nearestHospitals = [ph[0], ...nearestHospitals].slice(0, 4);
          }
        } else {
          // Move the existing enriched object to front
          nearestHospitals = [already, ...nearestHospitals.filter(h => h.id !== preferred.id)].slice(0, 4);
        }
      }
      console.log("Nearest hospitals:", nearestHospitals);
      
      if (nearestHospitals && nearestHospitals.length > 0) {
        setHospitalRecommendations(nearestHospitals);
        setShowHospitalPopup(true);
        setAlertSent(true);
      } else {
        alert("No hospitals found near your location. Please try again or enter a different location.");
      }
    } catch (error) {
      console.error("Error in condition analysis process:", error);
      alert("Failed to get hospital recommendations. Please try again.");
    } finally {
      setIsLoadingHospitals(false);
    }
  };
  
  // Notify emergency contacts
  const handleNotifyContacts = async () => {
    if (emergencyContacts.length === 0) {
      alert("You don't have any emergency contacts to notify");
      return;
    }
    
    try {
      if (!userLocation) {
        await handleGetLocation();
      }
      
      // For demo purposes, we'll just  the API call
      // In a real app, this would call the backend API
      /*
      const response = await notifyEmergencyContacts(
        "user123", // Replace with actual user ID
        "I need help. This is an emergency.",
        userLocation
      );
      */
      
      // Simulate success
      setContactsNotified(true);
      alert(`Emergency notification sent to ${emergencyContacts.length} contacts!`);
    } catch (error) {
      console.error("Error notifying contacts:", error);
      alert("Failed to notify emergency contacts. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f0f0f0] font-sans">
      {/* banner */}
      <div className="h-24"></div>
      <div className="w-full bg-gradient-to-r from-[#8B0000] to-[#c00000] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://img.freepik.com/free-vector/medical-pattern-background-vector-seamless_53876-140729.jpg')] bg-repeat opacity-20"></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Immediate Medical Assistance
          </h1>
          <p className="text-xl text-[#ffcccc] max-w-2xl mx-auto">
            {isPremium ? "Premium emergency services" : "Basic emergency access"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Emergency Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#f0f0f0] overflow-hidden transition-all hover:shadow-xl flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#8B0000] to-[#a00000] p-6">
              <div className="flex items-center">
                <Ambulance className="text-white mr-3" size={28} />
                <h2 className="text-2xl font-bold text-white">Emergency Response</h2>
                {preferredAmbulance && (
                  <span className="ml-4 text-xs bg-white/20 text-white px-2 py-1 rounded">
                    Preferred: {preferredAmbulance}
                  </span>
                )}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
                <div className="grid grid-cols-2 gap-3">
                  {ambulanceServices.map((service) => (
                    <button
                      key={service}
                      onClick={() => setSelectedService(service)}
                      className={`py-2 px-4 rounded-lg border transition-all ${selectedService === service 
                        ? 'bg-[#8B0000] text-white border-[#8B0000]' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#8B0000]'}`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Details</label>
                <div className="relative">
                  <textarea
                    value={emergencyText}
                    onChange={(e) => setEmergencyText(e.target.value)}
                    placeholder="Describe your emergency..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent min-h-[120px]"
                  />
                  <div className="absolute right-3 bottom-3 flex gap-2">
                    <button 
                      onClick={() => handleMicInput(setEmergencyText)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                    >
                      <Mic className="text-gray-600" size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleSendAlert}
                  className="flex-1 bg-gradient-to-r from-[#8B0000] to-[#a00000] text-white py-3 px-6 rounded-lg font-medium hover:brightness-110 transition flex items-center justify-center gap-2"
                  disabled={isLoadingLocation || ambulanceRequested}
                >
                  {isLoadingLocation ? (
                    <Loader className="animate-spin" size={18} />
                  ) : ambulanceRequested ? (
                    <Check size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  {ambulanceRequested ? 'Alert Sent' : 'Send Emergency Alert'}
                </button>
                <button 
                  className="flex-1 bg-white border border-[#8B0000] text-[#8B0000] py-3 px-6 rounded-lg font-medium hover:bg-[#fff0f0] transition flex items-center justify-center gap-2"
                  onClick={handleGetLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <MapPin size={18} />
                  )}
                  {userLocation ? 'Update Location' : 'Share Location'}
                </button>
              </div>
            </div>
          </div>

          {/* Medical Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#f0f0f0] overflow-hidden transition-all hover:shadow-xl flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#8B0000] to-[#a00000] p-6">
              <div className="flex items-center ">
                <Stethoscope className="text-white mr-3" size={28} />
                <h2 className="text-2xl font-bold text-white">Medical Assistance</h2>
                {/* {preferredHospital && preferredHospital !== 'Not specified' && (
                  <span className="ml-4 text-xs bg-white/20 text-white px-2 py-1 rounded">
                    Preferred: {preferredHospital}
                  </span>
                )} */}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="mb-6 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <div className="flex items-start">
                  <HeartPulse className="text-[#8B0000] p mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800">Preferred Hospital</h3>
                    <p className="text-gray-600 mt-1">{preferredHospital}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Condition</label>
                <div className="relative">
                  <textarea
                    value={conditionText}
                    onChange={(e) => setConditionText(e.target.value)}
                    placeholder="Describe your symptoms or condition..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent min-h-[120px]"
                  />
                  <div className="absolute right-3 bottom-3 flex gap-2">
                    <button 
                      onClick={() => handleMicInput(setConditionText)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                    >
                      <Mic className="text-gray-600" size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleSendCondition}
                  className="flex-1 bg-gradient-to-r from-[#8B0000] to-[#a00000] text-white py-3 px-6 rounded-lg font-medium hover:brightness-110 transition flex items-center justify-center gap-2"
                  disabled={isLoadingHospitals}
                >
                  {isLoadingHospitals ? (
                    <Loader className="animate-spin" size={18} />
                  ) : alertSent ? (
                    <Check size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  {isLoadingHospitals ? 'Analyzing...' : alertSent ? 'Analysis Complete' : 'Analyze Condition'}
                </button>
                <button 
                  className="flex-1 bg-white border border-[#8B0000] text-[#8B0000] py-3 px-6 rounded-lg font-medium hover:bg-[#fff0f0] transition flex items-center justify-center gap-2"
                  onClick={handleGetLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <MapPin size={18} />
                  )}
                  {userLocation ? 'Update Location' : 'Share Location'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contacts Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-[#f0f0f0] overflow-hidden">
          <div className="bg-gradient-to-r from-[#8B0000] to-[#a00000] p-6">
            <div className="flex items-center">
              <Phone className="text-white mr-3" size={28} />
              <h2 className="text-2xl font-bold text-white">
                {isPremium ? "Emergency Contacts" : "Emergency Contacts"}
              </h2>
            </div>
          </div>
          <div className="p-6">
            {/* Preferred hospital quick action */}
    {preferredHospitalObj && (
              <div className="mb-6 bg-[#fff8f8] p-4 rounded-lg border border-[#f3dada] flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Preferred hospital</div>
      <div className="font-semibold text-gray-800">{preferredHospitalObj.name}</div>
                </div>
                {preferredHospitalObj.contactNumber && (
                  <button
                    onClick={() => openWhatsAppOrCall(preferredHospitalObj.contactNumber, 'Emergency: Need immediate assistance')}
                    className="bg-[#8B0000] text-white px-4 py-2 rounded-lg text-sm hover:brightness-110"
                  >
                    Call / WhatsApp
                  </button>
                )}
              </div>
            )}
            {isPremium ? (
              emergencyContacts.length > 0 ? (
                <div>
                  <button
                    onClick={handleNotifyContacts}
                    className={`w-full mb-4 ${contactsNotified
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gradient-to-r from-[#8B0000] to-[#a00000] hover:brightness-110'
                    } text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2`}
                    disabled={contactsNotified}
                  >
                    {contactsNotified ? <Check size={18} /> : <AlertTriangle size={18} />}
                    {contactsNotified ? 'Contacts Notified' : 'Notify All Emergency Contacts'}
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emergencyContacts.map((contact, index) => (
                      <div key={contact.id || index} className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] hover:border-[#8B0000] transition group">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-800">{contact.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{contact.number}</p>
                          </div>
                          <a 
                            href={`tel:${contact.number}`} 
                            className="p-2 bg-white rounded-full shadow-sm group-hover:bg-[#8B0000] group-hover:text-white transition"
                          >
                            <Phone className="text-gray-600 group-hover:text-white" size={18} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#f8fafc] p-8 rounded-lg border-2 border-dashed border-[#e2e8f0] text-center">
                  <div className="max-w-md mx-auto">
                    <AlertTriangle className="mx-auto text-[#8B0000] mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Emergency Contacts</h3>
                    <p className="text-gray-600 mb-6">Add your emergency contacts to get quick access during emergencies</p>
                    <button 
                      onClick={() => navigate('/emergency-patient')}
                      className="bg-gradient-to-r from-[#8B0000] to-[#a00000] text-white py-3 px-8 rounded-lg font-medium hover:brightness-110 transition inline-flex items-center gap-2"
                    >
                      <span>Add Emergency Contacts</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-[#f8fafc] p-8 rounded-lg border-2 border-dashed border-[#e2e8f0] text-center">
                <div className="max-w-md mx-auto">
                  <AlertTriangle className="mx-auto text-[#8B0000] mb-4" size={48} />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency Contacts Locked</h3>
                  <p className="text-gray-600 mb-6">Upgrade to premium to access your emergency contacts and additional safety features</p>
                  <button 
                    onClick={() => navigate('/premium')}
                    className="bg-gradient-to-r from-[#8B0000] to-[#a00000] text-white py-3 px-8 rounded-lg font-medium hover:brightness-110 transition inline-flex items-center gap-2"
                  >
                    <span>Upgrade Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hospital Recommendations Popup */}
      {showHospitalPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#f0f0f0] w-full max-w-5xl max-h-[85vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#8B0000] to-[#a00000] p-4 sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center">
                <Stethoscope className="text-white mr-3" size={24} />
                <h2 className="text-xl font-bold text-white">Nearest Hospital Recommendations</h2>
              </div>
              <button 
                onClick={() => setShowHospitalPopup(false)}
                className="text-white hover:text-red-200 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              {/* Condition Analysis */}
              <ConditionAnalysis analysis={conditionAnalysis} />
              
              {/* Hospital Recommendations  prioritized by proximity */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Hospitals Near You (Sorted by Distance)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {hospitalRecommendations.map((hospital, index) => (
                    <HospitalRecommendation 
                      key={hospital.id} 
                      hospital={hospital} 
                      index={index} 
                    />
                  ))}
                </div>
              </div>

            
            </div>
          </div>
        </div>
      )}
    </div>
  );
}