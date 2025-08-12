import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaDownload, FaPrint, FaEye, FaTimes, FaUser, FaPhone, FaHospital, FaFileMedical, FaHeart, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-qr-code';
import { ensureIceCode } from '../api/ice';

export default function IceCard() {
  const navigate = useNavigate();
  const { isPremium, premiumPlan } = useAuth();
  
  // State for emergency data
  const [emergencyData, setEmergencyData] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [qrCodeData, setQrCodeData] = useState('');
  const [iceCode, setIceCode] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [showWidgetInfo, setShowWidgetInfo] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Load data on component mount
  useEffect(() => {
    // Load emergency data
    const savedEmergencyData = localStorage.getItem('emergencyData');
    if (savedEmergencyData) {
      setEmergencyData(JSON.parse(savedEmergencyData));
    }

    // Load medical records
    const savedRecords = localStorage.getItem('uploadedRecords');
    if (savedRecords) {
      setMedicalRecords(JSON.parse(savedRecords));
    }

    // Ensure ICE code for current user (auth required)
    (async () => {
      try {
        const res = await ensureIceCode();
        if (res?.code) {
          setIceCode(res.code);
          const baseUrl = (import.meta.env?.VITE_PUBLIC_BASE_URL || window.location.origin).replace(/\/$/, '');
          const url = `${baseUrl}/ice/public/${res.code}`;
          setPublicUrl(url);
          setQrCodeData(url);
        } else {
          generateQRCodeData();
        }
      } catch (e) {
        // Fallback to local QR data if auth or API fails
        generateQRCodeData();
      }
    })();
  }, []);

  const generateQRCodeData = () => {
    const emergencyInfo = localStorage.getItem('emergencyData');
    const medicalRecords = localStorage.getItem('uploadedRecords');
    
    const qrData = {
      type: 'ICE_CARD',
      timestamp: new Date().toISOString(),
      emergencyData: emergencyInfo ? JSON.parse(emergencyInfo) : null,
      hasMedicalRecords: medicalRecords ? true : false,
      medicalRecordsCount: medicalRecords ? JSON.parse(medicalRecords).length : 0,
      instructions: 'Scan this QR code to access emergency medical information. Contact emergency services immediately if needed.'
    };

    setQrCodeData(JSON.stringify(qrData));
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'ice-emergency-qr.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handlePrintQR = () => {
    window.print();
  };

  const handleViewMedicalHistory = () => {
    setShowMedicalHistory(true);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
  };

  const handleDownloadRecord = (record) => {
    if (record.file) {
      const url = URL.createObjectURL(record.file);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] font-[Poppins] pt-0 pb-20 overflow-x-hidden">
     <div className="h-24"></div>
      
      {/* Header */}
  <div className="relative bg-gradient-to-br from-[#F8F4EC] to-[#f2dad5] w-full py-10 sm:py-14 shadow-md rounded-b-3xl flex items-center justify-center mb-8">
        <button
          onClick={() => navigate('/pro')}
          className="absolute top-4 left-4 text-[#6C0B14] hover:text-[#8a0f1a] transition"
        >
          <FaArrowLeft className="text-2xl" />
        </button>
        <div className="text-center space-y-2 sm:space-y-3 px-2 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#660000] leading-tight">
            ICE QR Card
          </h1>
          <p className="text-sm sm:text-base text-[#7a4f4f] font-medium">
            In Case of Emergency - Quick access to your medical information
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Emergency Information Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#7B1E22] mb-4 flex items-center">
            <FaUser className="mr-2" />
            Emergency Information Summary
          </h2>
          
          {emergencyData ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Patient Info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Patient Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {emergencyData.patientInfo?.name || 'Not provided'}</p>
                  <p><span className="font-medium">Blood Group:</span> {emergencyData.patientInfo?.bloodGroup || 'Not provided'}</p>
                  <p><span className="font-medium">Preferred Hospital:</span> {emergencyData.patientInfo?.preferredHospital || 'Not specified'}</p>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Emergency Contacts</h3>
                <div className="space-y-2 text-sm">
                  {emergencyData.contacts?.length > 0 ? (
                    emergencyData.contacts.map((contact, index) => (
                      <p key={contact.id}>
                        <span className="font-medium">{contact.name}:</span> {contact.number}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500">No emergency contacts added</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No emergency information found</p>
              <button
                onClick={() => navigate('/emergency-patient')}
                className="bg-[#6C0B14] text-white px-6 py-2 rounded-lg hover:bg-[#8a0f1a] transition"
              >
                Add Emergency Information
              </button>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#7B1E22] mb-4 flex items-center">
            <FaQrcode className="mr-2" />
            Emergency QR Code
          </h2>
          
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-4">
              {qrCodeData && (
                <QRCode
                  value={qrCodeData}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#6C0B14"
                />
              )}
            </div>
            {publicUrl && (
              <>
                <p className="text-xs text-gray-600 mb-1 break-all">Scan or visit: {publicUrl}</p>
                {publicUrl.includes('localhost') && (
                  <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 inline-block px-2 py-1 rounded">
                    Tip: Set VITE_PUBLIC_BASE_URL to your PC IP (e.g. http://192.168.x.x:5180) for scanning from a phone.
                  </p>
                )}
              </>
            )}
            
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Instructions for Emergency Responders:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                <li>• Scan this QR code to access patient's emergency information</li>
                <li>• Contact emergency services immediately if needed</li>
                <li>• Use the medical history link for complete records</li>
                <li>• Follow any specific medical instructions provided</li>
              </ul>
            </div>

      <div className="flex justify-center flex-wrap gap-3 sm:space-x-4">
              <button
                onClick={handleDownloadQR}
        className="bg-[#6C0B14] text-white px-4 sm:px-10 py-2 rounded-lg hover:bg-[#8a0f1a] transition flex items-center"
              >
                <FaDownload className="mr-2" />
                Download QR
              </button>
              <button
                onClick={handlePrintQR}
        className="bg-gray-600 text-white px-4 sm:px-10 py-2 rounded-lg hover:bg-gray-700 transition flex items-center"
              >
                <FaPrint className="mr-2" />
                Print QR
              </button>
              <button
                onClick={() => setShowWidgetInfo(true)}
                className="bg-[#6C0B14] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Add ICE Widget (Mobile)
              </button>
            </div>
          </div>
        </div>

        {/* Medical Records Access */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#7B1E22] mb-4 flex items-center">
            <FaFileMedical className="mr-2" />
            Complete Medical History
          </h2>
          
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Access to all uploaded medical reports and records for emergency responders
            </p>
            <button
              onClick={handleViewMedicalHistory}
              className="bg-[#6C0B14] text-white px-6 py-3 rounded-lg hover:bg-[#8a0f1a] transition flex items-center mx-auto"
            >
              <FaEye className="mr-2" />
              View Complete Medical History
            </button>
          </div>

          {medicalRecords.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                <strong>{medicalRecords.length}</strong> medical records available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Medical History Modal */}
      <AnimatePresence>
        {showMedicalHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-[#6C0B14] text-white p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">Complete Medical History</h3>
                <button
                  onClick={() => setShowMedicalHistory(false)}
                  className="text-white hover:text-gray-200 transition"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {medicalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => handleViewRecord(record)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-800">{record.name}</h4>
                            <p className="text-sm text-gray-600">
                              Uploaded: {new Date(record.uploadDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Size: {(record.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadRecord(record);
                              }}
                              className="text-[#6C0B14] hover:text-[#8a0f1a] transition"
                            >
                              <FaDownload />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaFileMedical className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No medical records uploaded yet</p>
                    <button
                      onClick={() => {
                        setShowMedicalHistory(false);
                        navigate('/upload-report');
                      }}
                      className="bg-[#6C0B14] text-white px-6 py-2 rounded-lg hover:bg-[#8a0f1a] transition"
                    >
                      Upload Medical Records
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ICE Widget Info Modal */}
      <AnimatePresence>
        {showWidgetInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-xl w-full"
            >
              <div className="p-5 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#6C0B14]">Add ICE to your phone</h3>
                <button onClick={() => setShowWidgetInfo(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>
              <div className="p-5 space-y-4 text-sm text-gray-700">
                <p>
                  You can add this ICE Card to your Home Screen for quick access. This opens the public ICE page with your QR code: {publicUrl || 'generate code above'}.
                </p>
                <div>
                  <p className="font-semibold">iOS Safari:</p>
                  <ul className="list-disc ml-5">
                    <li>Tap Share ▸ Add to Home Screen</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Android Chrome:</p>
                  <ul className="list-disc ml-5">
                    <li>Menu ▸ Add to Home screen</li>
                  </ul>
                </div>
                <p>
                  For a native lock-screen widget, we’ll add it in the Flutter app. We’ve prepared a deep link to the ICE public URL so the widget can open it instantly.
                </p>
                <details className="bg-gray-50 rounded p-3">
                  <summary className="cursor-pointer font-semibold">Flutter widget stub (for later)</summary>
                  <pre className="text-xs overflow-auto">
{`// Pseudo-code: Android Widget/iOS WidgetKit will open this deep link
final icePublicUrl = '${publicUrl || 'https://yourapp/ice/public/<code>'}';

// Use url_launcher to open the ICE page
// launchUrl(Uri.parse(icePublicUrl), mode: LaunchMode.externalApplication);

// For lock-screen widgets, create a native widget extension that renders a QR
// and link, then deep-link to icePublicUrl when tapped.`}
                  </pre>
                </details>
              </div>
              <div className="p-5 border-t flex justify-end">
                <button onClick={() => setShowWidgetInfo(false)} className="px-4 py-2 rounded bg-[#6C0B14] text-white">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Record Preview Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full"
            >
              {/* Modal Header */}
              <div className="bg-[#6C0B14] text-white p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">Medical Record Preview</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-white hover:text-gray-200 transition"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{selectedRecord.name}</h4>
                  <p className="text-sm text-gray-600">
                    Uploaded: {new Date(selectedRecord.uploadDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Size: {(selectedRecord.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {selectedRecord.type}
                  </p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleDownloadRecord(selectedRecord)}
                    className="bg-[#6C0B14] text-white px-4 py-2 rounded-lg hover:bg-[#8a0f1a] transition flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    Download Record
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
