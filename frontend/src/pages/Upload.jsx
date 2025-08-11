import { useState, useEffect } from "react";
import { CloudUpload, FileText, Trash2, Download, Eye, User, Heart, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../context/AuthContext';
import { listReports as apiListReports, uploadReport as apiUploadReport, deleteReport as apiDeleteReport } from '../api/reports';
import { fetchAllEmergencyData } from '../api/emergency';

export default function UploadReport() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);
  const { isPremium, premiumPlan } = useAuth();
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);

  // Load data on component mount
  useEffect(() => {
    // load from backend; fallback to localStorage
    const init = async () => {
      try {
        const reports = await apiListReports();
        setPreviousRecords(reports);
        localStorage.setItem('uploadedRecords', JSON.stringify(reports));
      } catch (e) {
        const saved = localStorage.getItem('uploadedRecords');
        if (saved) setPreviousRecords(JSON.parse(saved));
      }

      try {
        const all = await fetchAllEmergencyData();
        setEmergencyData(all);
        localStorage.setItem('emergencyData', JSON.stringify(all));
      } catch (e) {
        const saved = localStorage.getItem('emergencyData');
        if (saved) setEmergencyData(JSON.parse(saved));
      }
    };
    init();
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const uploaded = [];
    for (const file of files) {
      try {
        const saved = await apiUploadReport(file);
        uploaded.push(saved);
      } catch (e) {
        console.error('Upload failed for', file.name, e);
      }
    }
    if (uploaded.length) {
      const updatedRecords = [...previousRecords, ...uploaded];
      setPreviousRecords(updatedRecords);
      localStorage.setItem('uploadedRecords', JSON.stringify(updatedRecords));
    }
    // Keep a local UI list for in-session view
    setUploadedFiles([...uploadedFiles, ...files.map(f => ({ name: f.name }))]);
    event.target.value = '';
  };

  const handleFileRemove = (index) => {
    const updated = [...uploadedFiles];
    updated.splice(index, 1);
    setUploadedFiles(updated);
  };

  const handleRecordDelete = async (recordId) => {
    try {
      await apiDeleteReport(recordId);
    } catch (e) {
      console.error('Failed to delete from server, removing locally', e);
    }
    const updatedRecords = previousRecords.filter(record => (record._id || record.id) !== recordId);
    setPreviousRecords(updatedRecords);
    localStorage.setItem('uploadedRecords', JSON.stringify(updatedRecords));
  };

  const handleDownload = (record) => {
    // If record has a fileUrl from the server, use it; else fallback local object
    if (record.fileUrl) {
      const link = document.createElement('a');
      const backendOrigin = 'http://localhost:5000';
      link.href = record.fileUrl.startsWith('http') ? record.fileUrl : `${backendOrigin}${record.fileUrl}`;
      link.download = record.originalName || record.name || 'report';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
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

  const handleDelete = (record) => {
    handleRecordDelete(record.id);
  };

  const handleUpgrade = () => {
    // In a real app would redirect to payment processing
    // For now, we'll just set premium status
    // Note: Premium status is now managed by AuthContext
  };

  // Premium Member View
  return (
    <div className="min-h-screen bg-[#FFF8F0] font-[Poppins] pt-0 pb-20 flex flex-col items-center px-4">
      <div className="h-24"></div>

      {/* Top Banner */}
      <div className="relative bg-gradient-to-br from-[#F8F4EC] to-[#f2dad5] w-full h-[200px] sm:h-[240px] shadow-md rounded-b-3xl flex items-center justify-center mb-8">
        <div className="text-center space-y-2 sm:space-y-3 px-2 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#660000] leading-tight">
            Upload Reports
          </h1>
          <p className="text-sm sm:text-base text-[#7a4f4f] font-medium">
            Securely upload and manage your health documents
          </p>
        </div>
      </div>

      {/* Medical History Summary Section */}
      <div className="w-full max-w-6xl mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#7B1E22]">
              Medical History Summary
            </h2>
            <button
              onClick={() => setShowMedicalHistory(!showMedicalHistory)}
              className="flex items-center gap-2 bg-[#7B1E22] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#5f1316] transition-colors"
            >
              <Eye className="h-4 w-4" />
              {showMedicalHistory ? 'Hide' : 'View'} Details
            </button>
          </div>

          <AnimatePresence>
            {showMedicalHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Emergency Contacts Data */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#7B1E22] mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Emergency Information
                    </h3>
                    {emergencyData ? (
                      <div className="space-y-3">
                        {emergencyData.patientInfo?.name && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Name:</span>
                            <p className="text-gray-800">{emergencyData.patientInfo.name}</p>
                          </div>
                        )}
                        {emergencyData.patientInfo?.bloodGroup && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Blood Group:</span>
                            <p className="text-gray-800">{emergencyData.patientInfo.bloodGroup}</p>
                          </div>
                        )}
                        {emergencyData.patientInfo?.medicalHistory && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Medical History:</span>
                            <p className="text-gray-800 text-sm">{emergencyData.patientInfo.medicalHistory}</p>
                          </div>
                        )}
                        {emergencyData.contacts?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Emergency Contacts:</span>
                            <div className="mt-1">
                              {emergencyData.contacts.map((contact, index) => (
                                <p key={index} className="text-gray-800 text-sm">
                                  {contact.name} - {contact.number}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No emergency information saved yet</p>
                    )}
                  </div>

                  {/* Medical Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#7B1E22] mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Health Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Total Reports:</span>
                        <span className="text-[#7B1E22] font-semibold">{previousRecords.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Last Upload:</span>
                        <span className="text-gray-800 text-sm">
                          {previousRecords.length > 0 
                            ? new Date(previousRecords[previousRecords.length - 1].uploadDate).toLocaleDateString()
                            : 'No uploads yet'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Storage Used:</span>
                        <span className="text-gray-800 text-sm">
                          {previousRecords.length > 0 
                            ? (previousRecords.reduce((total, record) => total + (record.size || 0), 0) / (1024 * 1024)).toFixed(2) + ' MB'
                            : '0 MB'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex justify-center items-center gap-2 bg-[#FBF5F5] p-1 rounded-full shadow-inner w-[200px] mb-6">
        <button className="bg-[#7B1E22] text-white px-3 py-1 text-sm rounded-full font-medium">
          New Upload
        </button>
        <button className="text-[#7B1E22] px-3 py-1 text-sm rounded-full font-medium">
          Recent
        </button>
      </div>

      {/* Upload Box */}
      <label className="w-full max-w-md min-h-[200px] border-2 border-dashed border-[#7B1E22] bg-white/60 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#fff0e8] transition-shadow duration-300 shadow-md hover:shadow-xl mb-8 px-4">
        <CloudUpload className="h-8 w-8 text-[#7B1E22] mb-2" />
        <p className="text-[#7B1E22] text-sm text-center font-medium">
          Click to browse or drag and drop your files
        </p>
        <input type="file" multiple className="hidden" onChange={handleFileUpload} />
      </label>

      {/* Uploaded Files List */}
      <div className="w-full max-w-md space-y-3 mb-8">
        {uploadedFiles.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white/90 border border-[#f1e0e0] rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="text-[#7B1E22] h-4 w-4" />
              <span className="text-gray-800 text-sm font-mono truncate max-w-[160px]">
                {file.name}
              </span>
            </div>
            <button onClick={() => handleFileRemove(index)} title="Remove file">
              <Trash2 className="text-red-500 hover:text-red-700 w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Previous Records Section */}
      <div className="w-full max-w-5xl px-2 sm:px-4">
        <h2 className="text-lg font-semibold text-[#7B1E22] mb-4 text-center sm:text-left">
          Previous Records
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {previousRecords.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No records uploaded yet</p>
              <p className="text-sm text-gray-400">Upload your first medical report to get started</p>
            </div>
          ) : (
            previousRecords.map((record, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-lg border border-[#EADCDC] rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 p-4 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-mono text-[#333] mb-1">{record.originalName || record.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">Uploaded on {new Date(record.createdAt || record.uploadDate).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleDownload(record)}
                    className="text-[#7B1E22] hover:text-[#5f1316]"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleRecordDelete(record._id || record.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}