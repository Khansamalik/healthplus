import React from 'react';
import { Activity, AlertTriangle, ThermometerSnowflake, Pill, Brain, Stethoscope, Bone } from 'lucide-react';

const ConditionAnalysis = ({ analysis }) => {
  if (!analysis) {
    return null;
  }
  
  // Map urgency level to color and text
  const urgencyMap = {
    'CRITICAL': { color: 'bg-red-100 text-red-800', text: 'Critical', icon: <AlertTriangle className="text-red-600" size={18} /> },
    'HIGH': { color: 'bg-orange-100 text-orange-800', text: 'High', icon: <Activity className="text-orange-600" size={18} /> },
    'MEDIUM-HIGH': { color: 'bg-amber-100 text-amber-800', text: 'Medium-High', icon: <Activity className="text-amber-600" size={18} /> },
    'MEDIUM': { color: 'bg-yellow-100 text-yellow-800', text: 'Medium', icon: <ThermometerSnowflake className="text-yellow-600" size={18} /> },
    'LOW': { color: 'bg-green-100 text-green-800', text: 'Low', icon: <Pill className="text-green-600" size={18} /> }
  };
  
  // Map condition type to icon
  const conditionTypeMap = {
    'HEART': <Activity className="text-red-600" size={20} />,
    'NEUROLOGICAL': <Brain className="text-purple-600" size={20} />,
    'ORTHOPEDIC': <Bone className="text-blue-600" size={20} />,
    'PULMONARY': <Stethoscope className="text-green-600" size={20} />,
    'GASTROINTESTINAL': <Pill className="text-yellow-600" size={20} />,
    'IMMUNOLOGICAL': <AlertTriangle className="text-amber-600" size={20} />,
    'TRAUMA': <AlertTriangle className="text-red-600" size={20} />,
    'GENERAL': <Stethoscope className="text-gray-600" size={20} />
  };
  
  // Map confidence to color
  const confidenceMap = {
    'HIGH': { color: 'bg-green-100 text-green-800', text: 'High Confidence' },
    'MEDIUM': { color: 'bg-yellow-100 text-yellow-800', text: 'Medium Confidence' },
    'LOW': { color: 'bg-gray-100 text-gray-800', text: 'Low Confidence' }
  };
  
  const urgency = urgencyMap[analysis.urgencyLevel] || urgencyMap.MEDIUM;
  const conditionIcon = conditionTypeMap[analysis.conditionType] || conditionTypeMap.GENERAL;
  const confidence = confidenceMap[analysis.confidence] || confidenceMap.MEDIUM;
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">ML-Based Condition Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            {conditionIcon}
            <p className="text-gray-700 font-medium ml-2">Primary Diagnosis</p>
            <div className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${confidence.color}`}>
              {confidence.text}
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-[#8B0000] font-medium text-lg">{analysis.conditionName}</p>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgency.color} mt-1 self-start`}>
              {urgency.text} Urgency
            </div>
          </div>
        </div>
        
        {analysis.symptoms && analysis.symptoms.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <ThermometerSnowflake className="text-gray-600" size={18} />
              <p className="text-gray-700 font-medium ml-2">Detected Symptoms</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.symptoms.map((symptom, index) => (
                <span 
                  key={index}
                  className="bg-[#fff0f0] text-[#8B0000] px-2 py-1 rounded-full text-xs"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Alternative Conditions */}
      {analysis.alternativeConditions && analysis.alternativeConditions.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Alternative Possibilities:</p>
          <div className="flex flex-wrap gap-2">
            {analysis.alternativeConditions.map((condition, index) => (
              <div key={index} className="bg-gray-50 px-3 py-1 rounded-full text-sm flex items-center">
                <span className="font-medium text-gray-700 mr-1">{condition.name}</span>
                <span className="text-xs text-gray-500">({condition.score}/10)</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Required Specialists */}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Recommended Specialists:</p>
        <div className="flex flex-wrap gap-1">
          {analysis.requiredSpecialists.map((specialist, index) => (
            <span 
              key={index}
              className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
            >
              {specialist}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConditionAnalysis;
