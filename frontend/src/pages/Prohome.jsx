import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaFileUpload, FaUserEdit, FaQrcode, FaHospital, FaAmbulance, FaMapMarkerAlt, FaCrown, FaLock, FaUserFriends, FaBell, FaShieldAlt, FaPhone, FaTimes, FaLocationArrow } from "react-icons/fa";
import { MdLocalPharmacy } from "react-icons/md";
import { FaFlask } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { Stethoscope, HeartPulse, Mic, Send, MapPin, AlertTriangle, Loader, Check, X } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useEmergencyData } from '../context/EmergencyDataContext.jsx';
import HospitalRecommendation from '../components/HospitalRecommendation';
import ConditionAnalysis from '../components/ConditionAnalysis';
import { getCurrentLocation, notifyEmergencyContacts, requestAmbulance } from '../utils/emergencyService';
import { fetchHospitalData, findNearestHospitals } from '../utils/hospitalData';
import { analyzeSymptoms } from '../utils/symptomChecker';
import { createMedicineOrder, createLabOrder } from '../api/orders';

export default function HealthAppPage() {
  const navigate = useNavigate();
  const { isPremium, premiumPlan } = useAuth();
  const { contacts: ctxContacts, preferredAmbulance, preferredHospitalName, refresh } = useEmergencyData();
  const [user, setUser] = useState({ name: "User" });
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderType, setOrderType] = useState(''); // 'medicine' or 'lab'
  const [showMedicalCard, setShowMedicalCard] = useState(false);
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);
  const [showEmergencyContactCard, setShowEmergencyContactCard] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [preferredHospital, setPreferredHospital] = useState("Shifa International Hospital");
  const [conditionText, setConditionText] = useState("");
  const [selectedService, setSelectedService] = useState("1122");
  const [emergencyText, setEmergencyText] = useState("");
  // Location and analysis/recommendations state
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [hospitalRecommendations, setHospitalRecommendations] = useState([]);
  const [conditionAnalysis, setConditionAnalysis] = useState(null);
  const [showHospitalPopup, setShowHospitalPopup] = useState(false);
  const [contactsNotified, setContactsNotified] = useState(false);
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  
  const ambulanceServices = ["1122", "Edhi", "Chhipa", "Alkhidmat"];

  // Sync popup contacts from context for instant data
  useEffect(() => {
    if (showEmergencyContactCard) {
      setContacts(ctxContacts || []);
      refresh();
    }
  }, [showEmergencyContactCard, ctxContacts]);

  useEffect(() => {
    if (preferredAmbulance) setSelectedService(preferredAmbulance);
    if (preferredHospitalName) setPreferredHospital(preferredHospitalName);
  }, [preferredAmbulance, preferredHospitalName]);

  const handleMicInput = (setText) => {
    console.log("Voice input would activate here");
    setText("Sample voice input text"); // Mock implementation
  };

  const handleSendAlert = () => {
    (async () => {
      try {
        // Ensure location
        if (!userLocation) {
          await handleGetLocation();
        }
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const userId = currentUser?.id || currentUser?._id || currentUser?.userId;
        if (!userId) {
          alert('Please log in to request an ambulance.');
          return;
        }
        await requestAmbulance(userId, selectedService, emergencyText || 'Emergency assistance needed', userLocation);
        setAmbulanceRequested(true);
        alert(`Emergency alert sent to ${selectedService}!`);
        setEmergencyText("");
        setShowEmergencyCard(false);
      } catch (e) {
        console.error(e);
        alert('Failed to request ambulance.');
      }
    })();
  };

  useEffect(() => {
    // Load saved emergency contacts
    const emergencyData = JSON.parse(localStorage.getItem('emergencyData')) || {};
    if (emergencyData.contacts) {
      setContacts(emergencyData.contacts);
    }
  }, []);

  // Use premium status from context
  const effectivePremiumStatus = isPremium;

  const handleEmergencyAlert = () => {
    setShowEmergencyPopup(true);
  };

  const handleEmergencyAction = (action) => {
    // Handle different emergency actions
    switch(action) {
      case 'alert-contacts':
        navigate('/alert');
        break;
      case 'call-ambulance':
        navigate('/alert');
        break;
      case 'find-emergency-rooms':
        navigate('/map');
        break;
      default:
        break;
    }
    setShowEmergencyPopup(false);
  };

  const handleOrderClick = (item, type) => {
    setSelectedItem(item);
    setOrderType(type);
    setShowOrderPopup(true);
  };

  const handlePlaceOrder = async () => {
    try {
      const payload = { itemId: selectedItem.id, name: selectedItem.name, meta: selectedItem };
      if (orderType === 'medicine') {
        await createMedicineOrder(payload);
      } else {
        await createLabOrder(payload);
      }
      alert(`Order placed successfully for ${selectedItem.name}!`);
      setShowOrderPopup(false);
      setSelectedItem(null);
      setOrderType('');
    } catch (e) {
      console.error(e);
      alert('Failed to place order. Please ensure you are logged in.');
    }
  };

  // Location helper
  const handleGetLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const loc = await getCurrentLocation();
      setUserLocation(loc);
    } catch (e) {
      console.error('Location error:', e);
      // Fallback to Islamabad
      setUserLocation({ lat: 33.6844, lng: 73.0479, address: 'Islamabad, Pakistan' });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Medical: analyze and recommend (same flow as alert.jsx)
  const handleSendCondition = async () => {
    if (!conditionText.trim()) {
      alert('Please describe your medical condition');
      return;
    }
    setIsLoadingHospitals(true);
    try {
      // Ensure we have a location; fall back to Islamabad 
      if (!userLocation) {
        try {
          await handleGetLocation();
        } catch (error) {
          console.error('Error getting location:', error);
          setUserLocation({ lat: 33.6844, lng: 73.0479, address: 'Islamabad, Pakistan' });
        }
      }

      // Analyze the symptoms
      const analysis = await analyzeSymptoms(conditionText);
      setConditionAnalysis(analysis);

      // Get hospital data
      const hospitalData = await fetchHospitalData();

      // Use user location or Islamabad fallback
      const locationToUse = userLocation || { lat: 33.6844, lng: 73.0479, address: 'Islamabad, Pakistan' };

      // Find nearest hospitals similar to alert.jsx
      let nearestHospitals = findNearestHospitals(
        hospitalData,
        locationToUse,
        analysis.primaryCondition || conditionText,
        4,
        { maxDistanceKm: 25, minBeds: 1, minDoctors: 1, requireEmergency: true }
      );

      // Promote preferred hospital if available and in range
      let preferred = null;
      if (preferredHospital && preferredHospital !== 'Not specified') {
        preferred = hospitalData.find(h => (h.name || '').toLowerCase().includes(preferredHospital.toLowerCase()));
      }
      if (preferred) {
        const already = nearestHospitals.find(h => h.id === preferred.id);
        if (!already) {
          const ph = findNearestHospitals([preferred], locationToUse, '', 1, { maxDistanceKm: 25, minBeds: 0, minDoctors: 0, requireEmergency: false });
          if (ph.length > 0) {
            nearestHospitals = [ph[0], ...nearestHospitals].slice(0, 4);
          }
        } else {
          nearestHospitals = [already, ...nearestHospitals.filter(h => h.id !== preferred.id)].slice(0, 4);
        }
      }

      setHospitalRecommendations(nearestHospitals || []);
      setShowMedicalCard(false);
      setShowHospitalPopup(true);
    } catch (e) {
      console.error('Recommendation error:', e);
      alert('Failed to get hospital recommendations.');
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  // Contacts: notify
  const handleNotifyContacts = async () => {
    if (!contacts.length) {
      alert("You don't have any emergency contacts to notify");
      return;
    }
    try {
      if (!userLocation) {
        await handleGetLocation();
      }
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const userId = currentUser?.id || currentUser?._id || currentUser?.userId;
      if (!userId) {
        alert('Please log in to notify contacts.');
        return;
      }
      await notifyEmergencyContacts(userId, alertMessage || 'I need help. This is an emergency.', userLocation);
      setContactsNotified(true);
      alert(`Emergency notification sent to ${contacts.length} contacts!`);
      setShowEmergencyContactCard(false);
    } catch (e) {
      console.error(e);
      alert('Failed to notify contacts.');
    }
  };

  // Sample data for Medicines
  const medicines = [
    { id: 1, name: "Paracetamol 500mg", price: "Rs. 50", delivery: "20 mins", category: "Pain Relief", description: "Effective pain relief and fever reduction" },
    { id: 2, name: "Vitamin C 1000mg", price: "Rs. 120", delivery: "30 mins", category: "Vitamins", description: "Immune system booster" },
    { id: 3, name: "Omeprazole 20mg", price: "Rs. 85", delivery: "25 mins", category: "Digestive", description: "Acid reflux and stomach protection" },
  ];

  const fullMedicinesList = [
    ...medicines,
    { id: 4, name: "Cetirizine 10mg", price: "Rs. 65", delivery: "40 mins", category: "Allergy", description: "Allergy relief and antihistamine" },
    { id: 5, name: "Calcium + D3", price: "Rs. 180", delivery: "35 mins", category: "Supplements", description: "Bone health and calcium supplement" },
    { id: 6, name: "Ibuprofen 400mg", price: "Rs. 75", delivery: "25 mins", category: "Pain Relief", description: "Anti-inflammatory pain relief" },
  ];

  const labs = [
    { id: 1, name: "Islamabad Diagnostic Center", distance: "1.2 km", rating: "4.8", location: "Blue Area", tests: "300+ tests" },
    { id: 2, name: "Excel Labs Islamabad", distance: "2.5 km", rating: "4.6", location: "F-8", tests: "250+ tests" },
    { id: 6, name: "Chughtai Lab Islamabad", distance: "3.5 km", rating: "4.4", location: "G-7", tests: "300+ tests" },
  ];

  const fullLabsList = [
    ...labs,
    { id: 3, name: "Shifa International Labs", distance: "3.1 km", rating: "4.9", location: "H-8/4", tests: "400+ tests" },
  ];

  const features = [
    { icon: <FaExclamationTriangle className="text-3xl" />, title: "Emergency Alert", description: "Send instant alerts to hospitals and emergency contacts", isFree: true, path: "/alert" },
    { icon: <FaFileUpload className="text-3xl" />, title: "Medical Records", description: "Upload and store important health documents", isFree: false, path: "/upload-report" },
    { icon: <FaUserEdit className="text-3xl" />, title: "Emergency Setup", description: "Configure emergency contacts and preferences", isFree: false, path: "/emergency-patient" },
    { icon: <FaQrcode className="text-3xl" />, title: "Emergency QR", description: "Generate QR codes with medical info", isFree: false, path: "/ice-card" },
  ];

  return (
    <div className="bg-[#FEF3F3] min-h-screen">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Navbar Space */}
      <div className="h-24"></div>



      {/* banner */}
      <div className="relative bg-[#F5E6E8] py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="text-[#6C0B14] mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Sehat ka raabta,
              </h1>
              
              <p className="text-xl md:text-2xl opacity-90">
                Har waqt aap ke saath
              </p>
            </div>

            <div className="flex flex-col space-y-4 w-full md:w-auto">
              <button 
                onClick={handleEmergencyAlert}
                className="px-8 py-3 bg-[#6C0B14] text-[#FEF3F3] rounded-full font-bold hover:bg-[#8a0f1a] transition-all shadow-md flex items-center justify-center transform hover:scale-105"
              >
                <FaExclamationTriangle className="mr-2" />
                Emergency Alert
              </button>
              <button 
                onClick={() => navigate(effectivePremiumStatus ? '/upload-report' : '/upload-report')}
                className={`px-8 py-3 rounded-full font-bold transition-all shadow-md flex items-center justify-center ${
                  effectivePremiumStatus 
                    ? 'bg-[#A0153E] text-white hover:bg-[#B51F4A]' 
                    : 'bg-[#A0153E] text-white hover:bg-[#B51F4A]'
                }`}
              >
                {effectivePremiumStatus ? (
                  <>
                    <FaFileUpload className="mr-2" />
                    Digital Records
                  </>
                ) : (
                  <>
                    <FaFileUpload className="mr-2" />
                    Digital Records
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {features.map((feature) => (
            <FeatureCard 
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              isFree={feature.isFree}
              isPremiumUser={effectivePremiumStatus}
              onClick={() => feature.isFree || effectivePremiumStatus ? navigate(feature.path) : navigate('/premium')}
            />
          ))}
        </div>

        {/* Quick Access Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16 border border-[#F1ECE9]">
          <h2 className="text-3xl font-bold text-[#6C0B14] mb-8 text-center">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <button 
              onClick={() => setShowMedicalCard(true)}
              className="py-5 px-4 bg-[#F8F4EC] rounded-lg flex flex-col items-center hover:bg-[#6C0B14] hover:text-white transition-all group shadow-sm h-full"
            >
              <FaBell className="text-3xl mb-3 text-[#6C0B14] group-hover:text-white transition" />
              <span className="font-bold">Alert Hospitals</span>
              <span className="text-xs mt-1 text-gray-500 group-hover:text-white/80">Find the best-suited Emergency Rooms for your situation</span>
            </button>
            
            <button 
              onClick={() => effectivePremiumStatus ? setShowEmergencyContactCard(true) : navigate('/premium')}
              className={`py-5 px-4 rounded-lg flex flex-col items-center transition-all group shadow-sm relative h-full ${
                effectivePremiumStatus 
                  ? 'bg-[#F8F4EC] hover:bg-[#6C0B14] hover:text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-pointer'
              }`}
            >
              <FaUserFriends className={`text-3xl mb-3 ${effectivePremiumStatus ? 'text-[#6C0B14] group-hover:text-white' : 'text-gray-400'}`} />
              <span className={`font-bold ${!effectivePremiumStatus && 'text-gray-400'}`}>Alert E-Contacts</span>
              <span className="text-xs mt-1 text-gray-500 group-hover:text-white/80">
                {effectivePremiumStatus ? "Send an alert to your contacts in case of emergency" : "Premium Only"}
              </span>
              {!effectivePremiumStatus && (
                <FaLock className="absolute top-3 right-3 text-[#6C0B14]" />
              )}
            </button>
            
            <button 
              onClick={() => setShowEmergencyCard(true)}
              className="py-5 px-4 bg-[#F8F4EC] rounded-lg flex flex-col items-center hover:bg-[#6C0B14] hover:text-white transition-all group shadow-sm h-full"
            >
              <FaAmbulance className="text-3xl mb-3 text-[#6C0B14] group-hover:text-white" />
              <span className="font-bold">Call an Ambulance</span>
              <span className="text-xs mt-1 text-gray-500 group-hover:text-white/80">Request an ambulance urgently to your location</span>
            </button>
            
            <button 
              onClick={() => effectivePremiumStatus ? navigate('/ice-card') : navigate('/premium')}
              className={`py-5 px-4 rounded-lg flex flex-col items-center transition-all group shadow-sm relative h-full ${
                effectivePremiumStatus 
                  ? 'bg-[#F8F4EC] hover:bg-[#6C0B14] hover:text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-pointer'
              }`}
            >
              <FaQrcode className={`text-3xl mb-3 ${effectivePremiumStatus ? 'text-[#6C0B14] group-hover:text-white' : 'text-gray-400'}`} />
              <span className={`font-bold ${!effectivePremiumStatus && 'text-gray-400'}`}>QR Card</span>
              <span className="text-xs mt-1 text-gray-500 group-hover:text-white/80">
                {effectivePremiumStatus ? "Access your medical records conveniently in case of emergency" : "Premium Only"}
              </span>
              {!effectivePremiumStatus && (
                <FaLock className="absolute top-3 right-3 text-[#6C0B14]" />
              )}
            </button>
          </div>
        </div>

        {/* Medicines Section  WHOLE SECTION premium-only */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MdLocalPharmacy className="text-2xl text-[#6C0B14] mr-3" />
              <h2 className="text-2xl font-bold text-[#6C0B14]">Medicines</h2>
            </div>
            {effectivePremiumStatus ? (
              <button className="text-sm text-[#6C0B14] flex items-center">
                View all <IoIosArrowForward className="ml-1" />
              </button>
            ) : (
              <button 
                className="text-sm text-[#6C0B14] flex items-center"
                onClick={() => navigate('/premium')}
              >
                Upgrade to see medicines <IoIosArrowForward className="ml-1" />
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
            {effectivePremiumStatus ? (
              fullMedicinesList.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} onOrderClick={() => handleOrderClick(medicine, 'medicine')} />
              ))
            ) : (
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                className="bg-white rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center cursor-pointer w-full flex-shrink-0 p-6"
                style={{ height: "320px" }}
                onClick={() => navigate('/premium')}
              >
                <FaLock className="text-5xl text-[#6C0B14] mb-4" />
                <h3 className="text-lg font-bold text-[#6C0B14] mb-2">Premium Medicines</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">Upgrade to access full medicine catalogue and delivery</p>
                <button className="w-[320px] bg-[#6C0B14] hover:bg-[#8a0f1a] text-white py-3 rounded-lg text-sm font-medium transition-colors">
                  Upgrade Now
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Diagnostic Labs WHOLE SECTION premium-only  */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FaFlask className="text-2xl text-[#6C0B14] mr-3" />
              <h2 className="text-2xl font-bold text-[#6C0B14]">Diagnostic Labs</h2>
            </div>
            {effectivePremiumStatus ? (
              <button className="text-sm text-[#6C0B14] flex items-center">
                View all <IoIosArrowForward className="ml-1" />
              </button>
            ) : (
              <button 
                className="text-sm text-[#6C0B14] flex items-center"
                onClick={() => navigate('/premium')}
              >
                Upgrade to see labs <IoIosArrowForward className="ml-1" />
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
            {effectivePremiumStatus ? (
              fullLabsList.map((lab) => (
                <LabCard key={lab.id} lab={lab} onOrderClick={() => handleOrderClick(lab, 'lab')} />
              ))
            ) : (
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                className="bg-white rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center cursor-pointer w-full flex-shrink-0 p-6"
                style={{ height: "320px" }}
                onClick={() => navigate('/premium')}
              >
                <FaLock className="text-5xl text-[#6C0B14] mb-4" />
                <h3 className="text-lg font-bold text-[#6C0B14] mb-2">Premium Lab Network</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">Upgrade to access more diagnostic labs and discounted tests</p>
                <button className="w-[320px] bg-[#6C0B14] hover:bg-[#8a0f1a] text-white py-3 rounded-lg text-sm font-medium transition-colors">
                  Upgrade Now
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-16 border border-[#F1ECE9]">
          <h2 className="text-3xl font-bold text-[#6C0B14] mb-8 text-center">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-start p-4 hover:bg-[#F8F4EC] rounded-lg transition cursor-pointer">
              <div className="bg-[#E8F5E9] p-3 rounded-full mr-4">
                <FaBell className="text-[#2E7D32] text-xl" />
              </div>
              <div>
                <p className="font-bold">Emergency alert activated</p>
                <p className="text-sm text-gray-500">Today, 10:42 AM</p>
                <p className="text-xs text-gray-400 mt-1">Alert sent to 3 nearby hospitals</p>
              </div>
            </div>
            
            {effectivePremiumStatus && (
              <>
                <div className="flex items-start p-4 hover:bg-[#F8F4EC] rounded-lg transition cursor-pointer">
                  <div className="bg-[#E3F2FD] p-3 rounded-full mr-4">
                    <FaUserFriends className="text-[#1565C0] text-xl" />
                  </div>
                  <div>
                    <p className="font-bold">Emergency contacts notified</p>
                    <p className="text-sm text-gray-500">Yesterday, 3:15 PM</p>
                    <p className="text-xs text-gray-400 mt-1">5 contacts received your alert</p>
                  </div>
                </div>
                <div className="flex items-start p-4 hover:bg-[#F8F4EC] rounded-lg transition cursor-pointer">
                  <div className="bg-[#F3E5F5] p-3 rounded-full mr-4">
                    <FaHospital className="text-[#7B1FA2] text-xl" />
                  </div>
                  <div>
                    <p className="font-bold">Hospital check-in completed</p>
                    <p className="text-sm text-gray-500">Monday, 9:30 AM</p>
                    <p className="text-xs text-gray-400 mt-1">Records shared with City Hospital</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Alert Popup */}
      <AnimatePresence>
        {showEmergencyPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmergencyPopup(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <FaExclamationTriangle className="text-2xl text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#6C0B14]">Emergency Alert</h3>
                    <p className="text-sm text-gray-500">Choose your emergency action</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEmergencyPopup(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Emergency Options */}
              <div className="space-y-4 mb-6">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/alert')}
                  className="w-full p-4 bg-gradient-to-r from-[#6C0B14] to-[#8a0f1a] text-white rounded-xl font-semibold hover:from-[#8a0f1a] hover:to-[#6C0B14] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
                >
                  <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 group-hover:bg-opacity-30 transition-all flex-shrink-0">
                    <FaUserFriends className="text-xl" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-lg">Alert Emergency Contacts</div>
                    <div className="text-sm opacity-90">Send alert to your saved contacts</div>
                  </div>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/alert')}
                  className="w-full p-4 bg-gradient-to-r from-[#6C0B14] to-[#8a0f1a] text-white rounded-xl font-semibold hover:from-[#8a0f1a] hover:to-[#6C0B14] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
                >
                  <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 group-hover:bg-opacity-30 transition-all flex-shrink-0">
                    <FaAmbulance className="text-xl" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-lg">Call Ambulance</div>
                    <div className="text-sm opacity-90">Request ambulance with your location</div>
                  </div>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/map')}
                  className="w-full p-4 bg-gradient-to-r from-[#6C0B14] to-[#8a0f1a] text-white rounded-xl font-semibold hover:from-[#8a0f1a] hover:to-[#6C0B14] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
                >
                  <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 group-hover:bg-opacity-30 transition-all flex-shrink-0">
                    <FaLocationArrow className="text-xl" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-lg">Find Emergency Rooms</div>
                    <div className="text-sm opacity-90">Locate nearest emergency facilities</div>
                  </div>
                </motion.button>
              </div>

              {/* Cancel Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEmergencyPopup(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order/Appointment Popup */}
      <AnimatePresence>
        {showOrderPopup && selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderPopup(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-[#F9E8E8] p-3 rounded-full mr-4">
                    <span className="text-[#6C0B14] text-xl font-bold">
                      {orderType === 'medicine' ? '💊' : '🏥'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#6C0B14]">
                      {orderType === 'medicine' ? 'Order Medicine' : 'Book Appointment'}
                    </h3>
                    <p className="text-sm text-gray-500">Confirm your order details</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOrderPopup(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#6C0B14]">{selectedItem.name}</h4>
                    {orderType === 'medicine' && (
                      <span className="text-lg font-bold text-[#6C0B14]">{selectedItem.price}</span>
                    )}
                  </div>
                  {orderType === 'medicine' ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Category: {selectedItem.category}</p>
                      <p>Description: {selectedItem.description}</p>
                      <p>Delivery: {selectedItem.delivery}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Location: {selectedItem.location}</p>
                      <p>Rating: {selectedItem.rating} ⭐</p>
                      <p>Tests: {selectedItem.tests}</p>
                      <p>Distance: {selectedItem.distance}</p>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {orderType === 'medicine' ? 'Quantity' : 'Preferred Date'}
                    </label>
                    {orderType === 'medicine' ? (
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                      </select>
                    ) : (
                      <input 
                        type="date" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {orderType === 'medicine' ? 'Delivery Address' : 'Contact Number'}
                    </label>
                    <input 
                      type="text" 
                      placeholder={orderType === 'medicine' ? 'Enter your address' : 'Enter your phone number'}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  className="w-full py-3 bg-gradient-to-r from-[#6C0B14] to-[#8a0f1a] text-white rounded-xl font-semibold hover:from-[#8a0f1a] hover:to-[#6C0B14] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {orderType === 'medicine' ? 'Place Order' : 'Book Appointment'}
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowOrderPopup(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Card Popup */}
      <AnimatePresence>
        {showMedicalCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMedicalCard(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#8B0000] to-[#a00000] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Stethoscope className="text-white mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-white">Medical Assistance</h2>
                  </div>
                  <button 
                    onClick={() => setShowMedicalCard(false)}
                    className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                  <div className="flex items-start">
                    <HeartPulse className="text-[#8B0000] mr-3 mt-1 flex-shrink-0" />
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
                        onClick={() => {}} //mic handlerspace
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                      >
                        <Mic className="text-gray-600" size={18} />
                      </button>
                    </div>
                  </div>
                </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-16">
                  <button 
          onClick={handleSendCondition}
                    className="flex-1 bg-gradient-to-r from-[#8B0000] to-[#a00000] text-white py-3 px-6 rounded-lg font-medium hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
          {isLoadingHospitals ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
          {isLoadingHospitals ? 'Analyzing...' : 'Analyze Situation'}
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/map');
                      setShowMedicalCard(false);
                    }}
                    className="flex-1 bg-white border border-[#8B0000] text-[#8B0000] py-3 px-6 rounded-lg font-medium hover:bg-[#f0f7ff] transition flex items-center justify-center gap-2"
                  >
                    <MapPin size={18} />
                    Get Directions
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Contact Alert Popup */}
      <AnimatePresence>
        {showEmergencyContactCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmergencyContactCard(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#8B0000] to-[#a00000] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaUserFriends className="text-white mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-white">Alert Emergency Contacts</h2>
                  </div>
                  <button 
                    onClick={() => setShowEmergencyContactCard(false)}
                    className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map((contact, index) => (
                    <div key={index} className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] hover:border-[#8B0000] transition group">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-800">{contact.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{contact.number}</p>
                        </div>
                        <div className="p-2 bg-white rounded-full shadow-sm text-gray-500">
                          <AlertTriangle size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {contacts.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto text-[#8B0000] mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Emergency Contacts</h3>
                    <p className="text-gray-600 mb-6">Add emergency contacts to quickly alert them in case of emergency</p>
                    <button 
                      onClick={() => navigate('/emergency-patient')}
                      className="bg-gradient-to-r from-[#8B0000] to-[#a00000] text-white py-3 px-8 rounded-lg font-medium hover:brightness-110 transition inline-flex items-center gap-2"
                    >
                      <span>Add Contacts</span>
                      <FaUserEdit size={18} />
                    </button>
                  </div>
                )}

                {contacts.length > 0 && (
                  <div className="mt-6 flex justify-between items-center">
                    <button 
                      onClick={handleNotifyContacts}
                      className={`px-4 py-2 rounded-lg font-medium text-white ${contactsNotified ? 'bg-green-600' : 'bg-[#8B0000] hover:brightness-110'} flex items-center gap-2`}
                    >
                      {contactsNotified ? <Check size={18} /> : <AlertTriangle size={18} />}
                      {contactsNotified ? 'Contacts Notified' : 'Notify All'}
                    </button>
                    <button 
                      onClick={() => navigate('/emergency-contacts')}
                      className="text-[#8B0000] py-2 px-4 rounded-lg font-medium hover:bg-[#fff0f0] transition inline-flex items-center gap-2"
                    >
                      <FaUserEdit size={18} />
                      <span>Manage Contacts</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Card Popup */}
      <AnimatePresence>
        {showEmergencyCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmergencyCard(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#8B0000] to-[#a00000] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaAmbulance className="text-white mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-white">Emergency Response</h2>
                  </div>
                  <button 
                    onClick={() => setShowEmergencyCard(false)}
                    className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>
              <div className="p-6">
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

        <div className="flex gap-3">
                  <button 
                    onClick={handleSendAlert}
                    className="flex-1 bg-gradient-to-r from-[#8B0000] to-[#a00000] text-white py-3 px-6 rounded-lg font-medium hover:brightness-110 transition flex items-center justify-center gap-2 whitespace-nowrap"
                  >
          {ambulanceRequested ? <Check size={18} /> : <Send size={18} />}
          {ambulanceRequested ? 'Alert Sent' : 'Send Emergency Alert'}
                  </button>
                  <button 
          onClick={handleGetLocation}
          className="flex-1 bg-white border border-[#8B0000] text-[#8B0000] py-3 px-6 rounded-lg font-medium hover:bg-[#fff0f0] transition flex items-center justify-center gap-2"
                  >
          {isLoadingLocation ? <Loader className="animate-spin" size={18} /> : <MapPin size={18} />}
          {userLocation ? 'Update Location' : 'Share Location'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              {/* Hospital Recommendations */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Hospitals Near You (Sorted by Distance)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {hospitalRecommendations.map((hospital, index) => (
                    <HospitalRecommendation 
                      key={hospital.id || index}
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

// Recommendations popup similar to alert.jsx
// Add after the root return content

// FeatureCard component
function FeatureCard({ icon, title, description, isFree, isPremiumUser, onClick }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }} 
      className="bg-white rounded-lg p-4 shadow-md border border-[#e8d9c9] flex flex-col items-center text-center h-full relative"
      onClick={isFree || isPremiumUser ? onClick : undefined}
      style={{ cursor: isFree || isPremiumUser ? 'pointer' : 'default' }}
    >
      {!isFree && !isPremiumUser && (
        <div className="absolute top-2 right-2 bg-[#6C0B14] text-white text-xs px-1 py-0.5 rounded-full font-bold flex items-center">
          <FaLock className="mr-1" size={8} />
        </div>
      )}
      <div className="text-[#6C0B14] mb-3 p-2 bg-[#F9E8E8] rounded-full shadow-sm">{icon}</div>
      <h3 className="text-sm font-bold text-[#6C0B14] mb-2">{title}</h3>
      <p className="text-xs text-gray-600 leading-tight">{description}</p>
      {!isFree && !isPremiumUser }
    </motion.div>
  );
}

function MedicineCard({ medicine, onOrderClick }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }} 
      className="bg-white rounded-lg shadow-md border border-gray-100 flex flex-col min-w-[280px] flex-shrink-0"
      style={{ height: "320px" }}
    >
      <div className="p-5 flex-grow">
        <div className="text-center mb-4">
          <span className="bg-[#F9E8E8] text-[#6C0B14] px-3 py-2 rounded-full text-sm font-medium">
            {medicine.category}
          </span>
        </div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-[#6C0B14] mb-2">{medicine.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{medicine.description}</p>
          <div className="text-2xl font-bold text-[#6C0B14]">{medicine.price}</div>
        </div>
        <div className="text-center text-sm text-gray-500">
          Delivery in {medicine.delivery}
        </div>
      </div>
      <div className="px-5 pb-5">
        <button 
          onClick={onOrderClick}
          className="w-full bg-[#6C0B14] hover:bg-[#8a0f1a] text-white py-3 rounded-lg text-sm font-medium transition-colors"
        >
          Order Now
        </button>
      </div>
    </motion.div>
  );
}

function LabCard({ lab, onOrderClick }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }} 
      className="bg-white rounded-lg shadow-md border border-gray-100 flex flex-col min-w-[280px] flex-shrink-0"
      style={{ height: "320px" }}
    >
      <div className="p-5 flex-grow">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center bg-[#F8F4EC] px-3 py-2 rounded-full mx-auto w-fit">
            <span className="text-sm font-medium">{lab.rating}</span>
            <span className="text-yellow-500 ml-1">⭐</span>
          </div>
        </div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-[#6C0B14] mb-2">{lab.name}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <FaMapMarkerAlt className="mr-2 text-[#6C0B14]" size={12} />
              <span>{lab.location}</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="bg-gray-100 px-2 py-1 rounded mr-2">{lab.distance} away</span>
              <span>{lab.tests}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        <button 
          onClick={onOrderClick}
          className="w-full bg-[#6C0B14] hover:bg-[#8a0f1a] text-white py-3 rounded-lg text-sm font-medium transition-colors"
        >
          Book Appointment
        </button>
      </div>
    </motion.div>
  );
}

function FacilityItem({ name, details }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="flex items-start p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <FaHospital className="text-[#6C0B14] text-xl mr-4 mt-1" />
      <div>
        <h4 className="text-xl font-medium text-[#6C0B14]">{name}</h4>
        <p className="text-gray-600">{details}</p>
      </div>
    </motion.div>
  );
}
