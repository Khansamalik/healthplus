// symptomChecker.js
import axios from 'axios';

/**
 * Advanced symptom analyzer that simulates a real ML model like BERT
 * In a production app, this would call your backend API that uses the actual BERT model
 */
export const analyzeSymptoms = async (symptoms) => {
  try {
    console.log("Starting symptom analysis for:", symptoms);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Convert input to lowercase for case-insensitive matching
    const symptomsLower = symptoms.toLowerCase();
    
    // Create a comprehensive symptom feature set with weights (similar to ML model features)
    const symptomFeatures = [
      // Cardiac symptoms
      { name: 'chest pain', weight: 0.9, category: 'HEART' },
      { name: 'shortness of breath', weight: 0.8, category: 'HEART' },
      { name: 'palpitations', weight: 0.7, category: 'HEART' },
      { name: 'heart', weight: 0.5, category: 'HEART' },
      { name: 'cardiac', weight: 0.5, category: 'HEART' },
      { name: 'heart attack', weight: 0.95, category: 'HEART' },
      { name: 'chest pressure', weight: 0.85, category: 'HEART' },
      
      // Neurological symptoms
      { name: 'headache', weight: 0.9, category: 'NEUROLOGICAL' },
      { name: 'migraine', weight: 0.9, category: 'NEUROLOGICAL' },
      { name: 'head pain', weight: 0.8, category: 'NEUROLOGICAL' },
      { name: 'light sensitivity', weight: 0.7, category: 'NEUROLOGICAL' },
      { name: 'dizziness', weight: 0.6, category: 'NEUROLOGICAL' },
      { name: 'head', weight: 0.4, category: 'NEUROLOGICAL' },
      
      // Orthopedic symptoms
      { name: 'broke', weight: 0.7, category: 'ORTHOPEDIC' },
      { name: 'broken', weight: 0.7, category: 'ORTHOPEDIC' },
      { name: 'fracture', weight: 0.9, category: 'ORTHOPEDIC' },
      { name: 'bone', weight: 0.6, category: 'ORTHOPEDIC' },
      { name: 'sprain', weight: 0.8, category: 'ORTHOPEDIC' },
      { name: 'cannot move', weight: 0.7, category: 'ORTHOPEDIC' },
      { name: 'swelling', weight: 0.6, category: 'ORTHOPEDIC' },
      { name: 'joint', weight: 0.5, category: 'ORTHOPEDIC' },
      { name: 'leg', weight: 0.4, category: 'ORTHOPEDIC' },
      { name: 'arm', weight: 0.4, category: 'ORTHOPEDIC' },
      { name: 'wrist', weight: 0.4, category: 'ORTHOPEDIC' },
      
      // Respiratory symptoms
      { name: 'fever', weight: 0.8, category: 'PULMONARY' },
      { name: 'cough', weight: 0.7, category: 'PULMONARY' },
      { name: 'sore throat', weight: 0.8, category: 'PULMONARY' },
      { name: 'runny nose', weight: 0.5, category: 'PULMONARY' },
      { name: 'flu', weight: 0.7, category: 'PULMONARY' },
      { name: 'cold', weight: 0.6, category: 'PULMONARY' },
      { name: 'breathing', weight: 0.75, category: 'PULMONARY' },
      
      // Gastrointestinal symptoms
      { name: 'stomach', weight: 0.8, category: 'GASTROINTESTINAL' },
      { name: 'abdomen', weight: 0.8, category: 'GASTROINTESTINAL' },
      { name: 'vomit', weight: 0.9, category: 'GASTROINTESTINAL' },
      { name: 'diarrhea', weight: 0.9, category: 'GASTROINTESTINAL' },
      { name: 'nausea', weight: 0.7, category: 'GASTROINTESTINAL' },
      { name: 'food poisoning', weight: 0.85, category: 'GASTROINTESTINAL' },
      
      // Allergic symptoms
      { name: 'allergy', weight: 0.9, category: 'IMMUNOLOGICAL' },
      { name: 'rash', weight: 0.8, category: 'IMMUNOLOGICAL' },
      { name: 'hives', weight: 0.9, category: 'IMMUNOLOGICAL' },
      { name: 'itchy', weight: 0.7, category: 'IMMUNOLOGICAL' },
      { name: 'allergic', weight: 0.9, category: 'IMMUNOLOGICAL' },
      { name: 'swollen', weight: 0.8, category: 'IMMUNOLOGICAL' },
      
      // Trauma symptoms
      { name: 'cut', weight: 0.8, category: 'TRAUMA' },
      { name: 'bleeding', weight: 0.9, category: 'TRAUMA' },
      { name: 'blood', weight: 0.7, category: 'TRAUMA' },
      { name: 'wound', weight: 0.8, category: 'TRAUMA' },
      { name: 'injury', weight: 0.75, category: 'TRAUMA' },
      
      // Burn symptoms
      { name: 'burn', weight: 0.9, category: 'TRAUMA' },
      { name: 'fire', weight: 0.7, category: 'TRAUMA' },
      { name: 'scalding', weight: 0.8, category: 'TRAUMA' },
      
      // Fainting symptoms
      { name: 'dizzy', weight: 0.7, category: 'NEUROLOGICAL' },
      { name: 'faint', weight: 0.9, category: 'NEUROLOGICAL' },
      { name: 'unconscious', weight: 1.0, category: 'NEUROLOGICAL' },
      { name: 'passed out', weight: 0.9, category: 'NEUROLOGICAL' },
      { name: 'collapse', weight: 0.8, category: 'NEUROLOGICAL' }
    ];
    
    // Condition categories - these represent possible diagnoses
    const conditions = [
      {
        name: 'Cardiac Issue',
        type: 'HEART',
        urgencyLevel: 'HIGH',
        features: ['chest pain', 'shortness of breath', 'palpitations', 'heart', 'cardiac', 'heart attack', 'chest pressure'],
        specialists: ['Cardiologist', 'Emergency Medicine Specialist'],
        equipment: ['ECG machine', 'cardiac monitor', 'defibrillator'],
        baseScore: 0
      },
      {
        name: 'Severe Headache/Migraine',
        type: 'NEUROLOGICAL',
        urgencyLevel: 'MEDIUM',
        features: ['headache', 'migraine', 'head pain', 'light sensitivity', 'dizziness', 'head'],
        specialists: ['Neurologist', 'Emergency Medicine Specialist'],
        equipment: ['CT scanner', 'MRI', 'pain management'],
        baseScore: 0
      },
      {
        name: 'Possible Fracture/Sprain',
        type: 'ORTHOPEDIC',
        urgencyLevel: 'MEDIUM',
        features: ['broke', 'broken', 'fracture', 'bone', 'sprain', 'cannot move', 'swelling', 'joint', 'leg', 'arm', 'wrist'],
        specialists: ['Orthopedic Surgeon', 'Emergency Medicine Specialist'],
        equipment: ['X-ray machine', 'casting materials', 'splints'],
        baseScore: 0
      },
      {
        name: 'Respiratory Infection',
        type: 'PULMONARY',
        urgencyLevel: 'MEDIUM',
        features: ['fever', 'cough', 'sore throat', 'runny nose', 'flu', 'cold', 'breathing'],
        specialists: ['Pulmonologist', 'Infectious Disease Specialist'],
        equipment: ['oxygen therapy', 'nebulizer', 'respiratory support'],
        baseScore: 0
      },
      {
        name: 'Gastrointestinal Issue',
        type: 'GASTROINTESTINAL',
        urgencyLevel: 'MEDIUM',
        features: ['stomach', 'abdomen', 'vomit', 'diarrhea', 'nausea', 'food poisoning'],
        specialists: ['Gastroenterologist', 'Emergency Medicine Specialist'],
        equipment: ['IV fluids', 'diagnostic imaging', 'medication'],
        baseScore: 0
      },
      {
        name: 'Allergic Reaction',
        type: 'IMMUNOLOGICAL',
        urgencyLevel: 'MEDIUM-HIGH',
        features: ['allergy', 'rash', 'hives', 'itchy', 'allergic', 'swollen'],
        specialists: ['Allergist', 'Emergency Medicine Specialist'],
        equipment: ['epinephrine', 'antihistamines', 'respiratory support'],
        baseScore: 0
      },
      {
        name: 'Wound/Laceration',
        type: 'TRAUMA',
        urgencyLevel: 'MEDIUM',
        features: ['cut', 'bleeding', 'blood', 'wound', 'injury'],
        specialists: ['Emergency Medicine Specialist', 'Trauma Surgeon'],
        equipment: ['suture kit', 'bandages', 'antiseptics'],
        baseScore: 0
      },
      {
        name: 'Burn Injury',
        type: 'TRAUMA',
        urgencyLevel: 'HIGH',
        features: ['burn', 'fire', 'scalding'],
        specialists: ['Burn Specialist', 'Emergency Medicine Specialist'],
        equipment: ['burn treatment supplies', 'sterile dressings', 'pain management'],
        baseScore: 0
      },
      {
        name: 'Syncope/Fainting',
        type: 'NEUROLOGICAL',
        urgencyLevel: 'MEDIUM-HIGH',
        features: ['dizzy', 'faint', 'unconscious', 'passed out', 'collapse'],
        specialists: ['Neurologist', 'Cardiologist', 'Emergency Medicine Specialist'],
        equipment: ['ECG', 'CT scanner', 'monitoring equipment'],
        baseScore: 0
      }
    ];
    
    console.log("Calculating scores for conditions...");
    
    // Calculate scores for each condition based on symptoms mentioned
    for (const condition of conditions) {
      let score = 0;
      let matchedSymptoms = [];
      
      // Check each feature/symptom for this condition
      for (const feature of condition.features) {
        // Find the matching symptom feature to get its weight
        const symptomFeature = symptomFeatures.find(sf => sf.name === feature);
        
        if (symptomFeature && symptomsLower.includes(symptomFeature.name)) {
          score += symptomFeature.weight;
          matchedSymptoms.push(symptomFeature.name);
        }
      }
      
      // Add additional points for keyword frequency (simulating ML model's emphasis on repeated terms)
      condition.features.forEach(feature => {
        // Count occurrences of each feature
        let regex = new RegExp(feature, 'gi');
        let matches = symptomsLower.match(regex);
        if (matches && matches.length > 1) {
          score += (matches.length - 1) * 0.2; // Add 0.2 for each additional mention
        }
      });
      
      // Apply urgency modifier (simulating ML model's classification weighting)
      if (condition.urgencyLevel === 'HIGH') {
        score *= 1.3;
      } else if (condition.urgencyLevel === 'MEDIUM-HIGH') {
        score *= 1.2;
      }
      
      condition.score = score;
      condition.matchedSymptoms = matchedSymptoms;
    }
    
    // Sort conditions by score (highest first)
    conditions.sort((a, b) => b.score - a.score);
    console.log("Sorted conditions by score:", conditions.map(c => ({ name: c.name, score: c.score })));
    
    // Get the highest scoring condition
    const topCondition = conditions[0];
    
    // Only return a valid condition if it has a minimum score
    // This prevents low-confidence matches (similar to ML model confidence threshold)
    if (!topCondition || topCondition.score < 0.5) {
      console.log("No condition matched with sufficient confidence");
      return {
        conditionName: 'Unspecified Medical Condition',
        conditionType: 'GENERAL',
        urgencyLevel: 'MEDIUM',
        requiredSpecialists: ['Emergency Medicine Specialist', 'General Practitioner'],
        requiredEquipment: ['basic diagnostic equipment'],
        symptoms: ['various symptoms requiring medical attention'],
        confidence: 'LOW'
      };
    }
    
    // Format confidence level based on score (simulating ML model confidence scores)
    let confidence = 'LOW';
    if (topCondition.score > 2) {
      confidence = 'HIGH';
    } else if (topCondition.score > 1) {
      confidence = 'MEDIUM';
    }
    
    console.log(`Top condition: ${topCondition.name} with confidence: ${confidence}`);
    
    // Return properly formatted analysis (similar to what a real ML model would return)
    return {
      conditionName: topCondition.name,
      conditionType: topCondition.type,
      urgencyLevel: topCondition.urgencyLevel,
      requiredSpecialists: topCondition.specialists,
      requiredEquipment: topCondition.equipment,
      symptoms: topCondition.matchedSymptoms.length > 0 ? 
                topCondition.matchedSymptoms : 
                ['symptoms consistent with ' + topCondition.name],
      confidence: confidence,
      alternativeConditions: conditions.slice(1, 3)
        .filter(c => c.score > 0.5)
        .map(c => ({
          name: c.name,
          score: Math.round(c.score * 10) // Convert to a 0-10 scale
        }))
    };
    
  } catch (error) {
    console.error('Error in symptom analysis:', error);
    // Return a fallback result even if an error occurs
    return {
      conditionName: 'Analysis Error',
      conditionType: 'GENERAL',
      urgencyLevel: 'MEDIUM',
      requiredSpecialists: ['Emergency Medicine Specialist'],
      requiredEquipment: ['basic diagnostic equipment'],
      symptoms: ['error analyzing symptoms'],
      confidence: 'LOW'
    };
  }
};
