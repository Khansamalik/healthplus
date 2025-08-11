import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaLock, FaEye, FaQrcode, FaTimes, FaFileUpload, FaDownload, FaUser, FaPhone, FaHospital, FaInfoCircle, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchAllEmergencyData } from '../api/emergency';
import { useEmergencyData } from '../context/EmergencyDataContext.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const { isPremium, premiumPlan, isAuthenticated } = useAuth();
  
  // State for success indicators
  const [patientInfoSaved, setPatientInfoSaved] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [serviceSaved, setServiceSaved] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Emergency Contacts State
  const { 
    contacts, services: savedServices, patientInfo,
    addContact, updateContact: ctxUpdateContact, deleteContact: ctxDeleteContact,
    addService: ctxAddService, deleteService: ctxDeleteService,
    savePatientInfo: ctxSavePatientInfo, refresh
  } = useEmergencyData();
  const [contactsLocal, setContactsLocal] = useState([]);
  const [newContact, setNewContact] = useState({ name: "", number: "" });
  const [editingId, setEditingId] = useState(null);

  // Preferred Services State
  const [preferredServices, setPreferredServices] = useState({ hospital: "", ambulance: "" });

  // Patient Info State
  const [patientInfoLocal, setPatientInfoLocal] = useState({
    name: "",
    bloodGroup: "",
    medicalHistory: "",
    preferredHospital: "",
    additionalComments: ""
  });

  // New state for popup and QR code
  const [showSavedInfoPopup, setShowSavedInfoPopup] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');

  // Load data from API when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      // sync from context and also refresh in background
      setContactsLocal(contacts);
      setPatientInfoLocal({
        name: patientInfo?.name || "",
        bloodGroup: patientInfo?.bloodGroup || "",
        medicalHistory: patientInfo?.medicalHistory || "",
        preferredHospital: patientInfo?.preferredHospital || "",
        additionalComments: patientInfo?.additionalComments || ""
      });
      refresh();
    }
  }, [isAuthenticated]);

  // Function to load all emergency data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await refresh();
      setContactsLocal(contacts);
      setPatientInfoLocal({
        name: patientInfo?.name || "",
        bloodGroup: patientInfo?.bloodGroup || "",
        medicalHistory: patientInfo?.medicalHistory || "",
        preferredHospital: patientInfo?.preferredHospital || "",
        additionalComments: patientInfo?.additionalComments || ""
      });
      toast.info('Your emergency data has been loaded');
      
    } catch (err) {
      console.error('Error loading emergency data:', err);
      setError('Failed to load your emergency data. Please try again.');
      
      // Fallback to localStorage if API fails
      const savedContacts = localStorage.getItem('emergencyContacts');
      if (savedContacts) setContacts(JSON.parse(savedContacts));
      
      const savedServicesData = localStorage.getItem('preferredServices');
      if (savedServicesData) setSavedServices(JSON.parse(savedServicesData));
      
      const savedPatientInfo = localStorage.getItem('patientInfo');
      if (savedPatientInfo) setPatientInfo(JSON.parse(savedPatientInfo));
    } finally {
      setLoading(false);
    }
  };

  // Emergency Contacts Handlers
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.number) return;
    
    setLoading(true);
    setContactSaved(false);
    try {
      console.log('Submitting contact form with:', { editingId, newContact });
      
      if (editingId) {
        // Update existing contact
        console.log(`Updating contact with ID: ${editingId}`);
        const updatedContact = await ctxUpdateContact(editingId, {
          name: newContact.name,
          number: newContact.number
        });
        
        console.log('API returned updated contact:', updatedContact);
        
        // Local UI state
        const updatedContacts = contacts.map(contact => (contact._id === editingId || contact.id === editingId) ? updatedContact : contact);
        setContactsLocal(updatedContacts);
        
        toast.success('Contact updated successfully!');
      } else {
        // Create new contact
        console.log('Creating new contact');
        const newContactData = await addContact({
          name: newContact.name,
          number: newContact.number
        });
        
        console.log('API returned new contact:', newContactData);
        
        const updatedContacts = [...contacts, newContactData];
        setContactsLocal(updatedContacts);
        
        toast.success('Contact added successfully!');
      }
      
      // Reset form
      setEditingId(null);
      setNewContact({ name: "", number: "" });
      setContactSaved(true);
      
      // Hide success indicator after 3 seconds
      setTimeout(() => setContactSaved(false), 3000);
      
  // Already persisted above when computing updatedContacts
    } catch (err) {
      console.error('Error saving contact:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error(`Failed to save contact: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id) => {
    setLoading(true);
    try {
      await ctxDeleteContact(id);
      const updatedContacts = contacts.filter(contact => (contact._id || contact.id) !== id);
      setContactsLocal(updatedContacts);
      
      // Reset form if deleting the contact being edited
      if (editingId === id) {
        setEditingId(null);
        setNewContact({ name: "", number: "" });
      }
      
      toast.success('Contact deleted successfully!');
    } catch (err) {
      console.error('Error deleting contact:', err);
      toast.error('Failed to delete contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Preferred Services Handlers
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!preferredServices.hospital && !preferredServices.ambulance) return;
    
    setLoading(true);
    setServiceSaved(false);
    try {
      console.log('Submitting service with data:', preferredServices);
      
      const newServiceData = await ctxAddService({
        hospital: preferredServices.hospital,
        ambulance: preferredServices.ambulance
      });
      
      console.log('API returned new service:', newServiceData);
      
      // Update local state
  // Context already updated; nothing else needed
      console.log('Updated services state:', updatedServices);
      
      // Reset form
      setPreferredServices({ hospital: "", ambulance: "" });
      setServiceSaved(true);
      
      // Hide success indicator after 3 seconds
      setTimeout(() => setServiceSaved(false), 3000);
      
      // Also update localStorage as a backup
      localStorage.setItem('preferredServices', JSON.stringify(updatedServices));
      
      toast.success('Service preferences saved successfully!');
    } catch (err) {
      console.error('Error saving service preferences:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error(`Failed to save service: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    setLoading(true);
    try {
      await ctxDeleteService(id);
      
      toast.success('Service preference deleted successfully!');
    } catch (err) {
      console.error('Error deleting service preference:', err);
      toast.error('Failed to delete service preference. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Patient Info Handler
  const handlePatientInfoSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setPatientInfoSaved(false);
    try {
      console.log('Submitting patient info:', patientInfoLocal);
      const updatedInfo = await ctxSavePatientInfo(patientInfoLocal);
      
      // Local UI state reflect
      // no-op, context will push fresh values
      setPatientInfoSaved(true);
      
      // Hide success indicator after 3 seconds
      setTimeout(() => setPatientInfoSaved(false), 3000);
      
      // Also update localStorage as a backup
      localStorage.setItem('patientInfo', JSON.stringify(updatedInfo));
      
      toast.success('Your medical information has been saved successfully!');
    } catch (err) {
      console.error('Error saving patient info:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error(`Failed to save medical info: ${err.response?.data?.message || err.message}`);
      
      // Fallback to localStorage
      localStorage.setItem('patientInfo', JSON.stringify(patientInfo));
    } finally {
      setLoading(false);
    }
  };

  // View saved information
  const handleViewSavedInfo = () => {
    refresh();
    // Then show the popup
    setShowSavedInfoPopup(true);
  };

  // Generate QR code
  const handleGenerateQRCode = async () => {
    try {
      // Refresh data from API first
      await loadAllData();
      
      // Format emergency data for QR code
      const emergencyData = {
  contacts: contacts,
  savedServices: savedServices,
  patientInfo: patientInfo,
        timestamp: new Date().toISOString()
      };
      
      const dataString = JSON.stringify(emergencyData, null, 2);
      setQrCodeData(dataString);
      setShowQRCode(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
      toast.error('Failed to generate QR code. Please try again.');
    }
  };

  // Download QR code
  const handleDownloadQRCode = async () => {
    try {
      // Refresh data from API first
      await loadAllData();
      
      // Format emergency data for download
      const emergencyData = {
  contacts: contacts,
  savedServices: savedServices,
  patientInfo: patientInfo,
        timestamp: new Date().toISOString()
      };
      
      const dataString = JSON.stringify(emergencyData, null, 2);
      const blob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'emergency-info.json';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Emergency information downloaded successfully!');
    } catch (err) {
      console.error('Error downloading emergency data:', err);
      toast.error('Failed to download emergency information. Please try again.');
    }
  };

  // Navigate to upload report page
  const handleGetFullMedicalHistory = () => {
    navigate('/upload-report');
  };

     // Original premium content
   return (
     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
     <div className="h-24"></div>
      {/* Header */}
      <div className="w-full relative bg-[#6C0B14] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative w-full py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Emergency Health Preferences
            </h1>
            <p className="mt-6 text-xl text-[#FFB6B6] max-w-3xl mx-auto">
              Manage your emergency contacts, preferred services, and medical information
            </p>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 gap-8">
        {/* Emergency Contacts Card */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
          <div className="p-6 bg-[#6C0B14] text-white flex items-center">
            <FaPhone className="mr-3" size={20} />
            <div>
              <h2 className="text-xl font-bold">Emergency Contacts</h2>
              <p className="text-[#FFB6B6] text-sm">Add people to contact in emergencies</p>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleContactSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 flex border border-gray-300 rounded-lg overflow-hidden bg-white">
                <input
                  type="text"
                  placeholder="Contact Name"
                  className="flex-1 px-4 py-3 outline-none"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  required
                />
                <div className="w-px bg-gray-300"></div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="flex-1 px-4 py-3 outline-none"
                  value={newContact.number}
                  onChange={(e) => setNewContact({...newContact, number: e.target.value})}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#6C0B14] hover:bg-[#800000] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? "Saving..." : editingId ? "Update" : "Add Contact"}
                {contactSaved && <FaCheck className="ml-2 text-green-300" />}
              </button>
            </form>
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No emergency contacts added yet</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact._id || contact.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <h3 className="font-medium text-gray-800">{contact.name}</h3>
                      <p className="text-gray-600">{contact.number}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setNewContact({ name: contact.name, number: contact.number });
                          setEditingId(contact._id || contact.id);
                        }}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact._id || contact.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Preferred Services Card */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
          <div className="p-6 bg-[#6C0B14] text-white flex items-center">
            <FaHospital className="mr-3" size={20} />
            <div>
              <h2 className="text-xl font-bold">Preferred Services</h2>
              <p className="text-[#FFB6B6] text-sm">Set your preferred healthcare providers</p>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleServiceSubmit} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Hospital</label>
                  <input
                    type="text"
                    value={preferredServices.hospital}
                    onChange={(e) => setPreferredServices({...preferredServices, hospital: e.target.value})}
                    placeholder="Enter hospital name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Ambulance</label>
                  <input
                    type="text"
                    value={preferredServices.ambulance}
                    onChange={(e) => setPreferredServices({...preferredServices, ambulance: e.target.value})}
                    placeholder="Enter ambulance service"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#6C0B14] hover:bg-[#800000] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Preferences"}
                {serviceSaved && <FaCheck className="ml-2 text-green-300" />}
              </button>
            </form>
            <div className="space-y-4">
              {savedServices.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No preferred services saved yet</p>
                </div>
              ) : (
                savedServices.map((service) => (
                  <div key={service._id || service.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.hospital && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Hospital</h3>
                          <p className="text-gray-800">{service.hospital}</p>
                        </div>
                      )}
                      {service.ambulance && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Ambulance Service</h3>
                          <p className="text-gray-800">{service.ambulance}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteService(service._id || service.id)}
                      className="mt-3 text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* My Information Card */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
          <div className="p-6 bg-[#6C0B14] text-white flex items-center">
            <FaUser className="mr-3" size={20} />
            <div>
              <h2 className="text-xl font-bold">My Information</h2>
              <p className="text-[#FFB6B6] text-sm">Your personal medical details</p>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handlePatientInfoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={patientInfo.bloodGroup}
                    onChange={(e) => setPatientInfo({...patientInfo, bloodGroup: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent bg-white"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                <textarea
                  value={patientInfo.medicalHistory}
                  onChange={(e) => setPatientInfo({...patientInfo, medicalHistory: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent"
                  rows="4"
                  placeholder="Any allergies, chronic conditions, or important medical history"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Hospital</label>
                  <input
                    type="text"
                    value={patientInfo.preferredHospital}
                    onChange={(e) => setPatientInfo({...patientInfo, preferredHospital: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent"
                    placeholder="Your preferred hospital"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                  <input
                    type="text"
                    value={patientInfo.additionalComments}
                    onChange={(e) => setPatientInfo({...patientInfo, additionalComments: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C0B14] focus:border-transparent"
                    placeholder="Any additional comments"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#6C0B14] hover:bg-[#800000] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save My Information"}
                {patientInfoSaved && <FaCheck className="ml-2 text-green-300" />}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                This information will be displayed to emergency responders when needed.
              </p>
            </form>
          </div>
        </section>

        {/* Action Buttons at the bottom */}
        <div className="col-span-1">
          <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
            <button
              onClick={handleViewSavedInfo}
              className="flex items-center justify-center gap-2 bg-[#6C0B14] hover:bg-red-800 text-white py-3 px-18 rounded-lg font-medium transition-colors"
            >
              <FaEye className="text-lg" />
              View Saved Info
            </button>
            <button
              onClick={handleGenerateQRCode}
              className="flex items-center justify-center gap-2 bg-[#6C0B14] hover:bg-red-800 text-white py-3 px-18 rounded-lg font-medium transition-colors"
            >
              <FaQrcode className="text-lg" />
              Generate QR Code
            </button>
            <button
              onClick={handleGetFullMedicalHistory}
              className="flex items-center justify-center gap-2 bg-[#6C0B14] hover:bg-red-800 text-white py-3 px-18 rounded-lg font-medium transition-colors"
            >
              <FaFileUpload className="text-lg" />
              Full Medical History
            </button>
          </div>
        </div>
      </div>

      {/* Saved Information Popup */}
      <AnimatePresence>
        {showSavedInfoPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSavedInfoPopup(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaEye className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#6C0B14]">Saved Emergency Information</h3>
                    <p className="text-sm text-gray-500">Your complete emergency setup</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSavedInfoPopup(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-[#6C0B14] mb-3">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <p className="text-gray-800">{patientInfo.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Blood Group:</span>
                      <p className="text-gray-800">{patientInfo.bloodGroup || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Medical History:</span>
                      <p className="text-gray-800">{patientInfo.medicalHistory || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Preferred Hospital:</span>
                      <p className="text-gray-800">{patientInfo.preferredHospital || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Additional Comments:</span>
                      <p className="text-gray-800">{patientInfo.additionalComments || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-[#6C0B14] mb-3">Emergency Contacts</h4>
                  {contacts.length === 0 ? (
                    <p className="text-gray-500">No emergency contacts added</p>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <div key={contact._id || contact.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{contact.name}</p>
                            <p className="text-gray-600">{contact.number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferred Services */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-[#6C0B14] mb-3">Preferred Services</h4>
                  {savedServices.length === 0 ? (
                    <p className="text-gray-500">No preferred services saved</p>
                  ) : (
                    <div className="space-y-2">
                      {savedServices.map((service) => (
                        <div key={service._id || service.id} className="p-3 bg-white rounded-lg">
                          {service.hospital && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-600">Hospital:</span>
                              <p className="text-gray-800">{service.hospital}</p>
                            </div>
                          )}
                          {service.ambulance && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Ambulance:</span>
                              <p className="text-gray-800">{service.ambulance}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Popup */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRCode(false)}
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
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <FaQrcode className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#6C0B14]">Emergency QR Code</h3>
                    <p className="text-sm text-gray-500">Scan to access your emergency info</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQRCode(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

                             {/* Emergency Data Display */}
               <div className="text-center mb-6">
                 <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 max-h-60 overflow-y-auto">
                   <h4 className="text-sm font-bold text-[#6C0B14] mb-2">Emergency Information Data</h4>
                   <pre className="text-xs text-gray-700 text-left whitespace-pre-wrap">
                     {qrCodeData}
                   </pre>
                 </div>
               </div>

               {/* Download Button */}
               <button
                 onClick={handleDownloadQRCode}
                 className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
               >
                 <FaDownload className="text-lg" />
                 Download JSON File
               </button>

               <p className="text-xs text-gray-500 mt-3 text-center">
                 Save this file to your phone for emergency access
               </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toast notifications container */}
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}