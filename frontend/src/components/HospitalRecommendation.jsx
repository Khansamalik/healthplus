import React from 'react';
import { MapPin, ThumbsUp, ShieldAlert, Stethoscope, Users, Briefcase, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { openWhatsAppOrCall } from '../utils/phone';

const HospitalRecommendation = ({ hospital, index }) => {
  const navigate = useNavigate();
  
  const handleGetDirections = () => {
    // Navigate to the simplified map page with hospital data
    navigate('/pmap', {
      state: { hospital }
    });
  };

  const handleCall = () => {
    if (!hospital.contactNumber) return;
    openWhatsAppOrCall(hospital.contactNumber, 'Emergency: Need immediate assistance');
  };
  
  // Safe derived values
  const distanceKm = (() => {
    const d = parseFloat(hospital?.distance);
    return Number.isFinite(d) ? d : 2.5;
  })();
  const scorePct = (() => {
    const s = Math.round(Number(hospital?.score));
    return Number.isFinite(s) ? s : 80;
  })();
  const ec = hospital?.emergencyCapacity || {};
  const availableBeds = ec.available ?? 1;
  const totalBeds = ec.total ?? 5;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
      <div className="bg-gradient-to-r from-[#8B0000] to-[#a00000] p-4 text-white flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-white text-[#8B0000] w-8 h-8 rounded-full font-bold mr-3">
            {index + 1}
          </div>
          <h3 className="font-bold">{hospital.name}</h3>
        </div>
        <div className="flex items-center">
          <ThumbsUp className="mr-1" size={16} />
          <span>{scorePct}%</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start mb-3">
          <MapPin className="text-gray-500 mr-2 mt-1 flex-shrink-0" size={18} />
          <p className="text-gray-700 text-sm">{hospital.location?.address || 'Address unavailable'}</p>
        </div>
        
        <div className="flex items-start mb-3">
          <ShieldAlert className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
          <div>
            <p className="text-gray-700 text-sm font-medium">Emergency Capacity</p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-amber-600">{availableBeds}</span> out of {totalBeds} beds available
            </p>
          </div>
        </div>
        
        <div className="flex items-start mb-3">
          <Users className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={18} />
          <div>
            <p className="text-gray-700 text-sm font-medium">Medical Staff</p>
            <p className="text-gray-600 text-sm">
              {hospital.doctors || hospital.emergencyCapacity?.doctors || '5'} doctors available
            </p>
          </div>
        </div>
        
        <div className="flex items-start mb-4">
          <Briefcase className="text-indigo-500 mr-2 mt-1 flex-shrink-0" size={18} />
          <div>
            <p className="text-gray-700 text-sm font-medium">Equipment</p>
            <p className="text-gray-600 text-sm">
              {hospital.equipment ? (Array.isArray(hospital.equipment) ? hospital.equipment.join(', ') : hospital.equipment) : 'Standard emergency equipment'}
            </p>
          </div>
        </div>
        
        <div className="flex items-start mb-4">
          <Stethoscope className="text-[#8B0000] mr-2 mt-1 flex-shrink-0" size={18} />
          <div>
            <p className="text-gray-700 text-sm font-medium">Why Recommended</p>
            <p className="text-gray-600 text-sm">{hospital.reason || `${distanceKm.toFixed(1)}km away • Best match for your condition`}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleCall}
            className="flex-1 bg-[#8B0000] text-white py-2 px-3 rounded text-sm font-medium hover:bg-[#a00000] transition text-center flex items-center justify-center"
          >
            <Phone size={16} className="mr-1" /> Call / WhatsApp
          </button>
          <button 
            onClick={handleGetDirections}
            className="flex-1 border border-[#8B0000] text-[#8B0000] py-2 px-3 rounded text-sm font-medium hover:bg-[#fff0f0] transition text-center flex items-center justify-center"
          >
            <MapPin size={16} className="mr-1" /> Directions
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalRecommendation;
