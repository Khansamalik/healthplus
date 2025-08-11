import natural from 'natural';
import MedicalCondition from '../models/MedicalCondition.js';

// Natural language processing tokenizer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Medical keywords for different conditions
const MEDICAL_KEYWORDS = {
  HEART: ['heart', 'chest', 'pain', 'pressure', 'cardiac', 'palpitation', 'cardiovascular'],
  TRAUMA: ['accident', 'injury', 'broken', 'fracture', 'bleeding', 'wound', 'trauma'],
  RESPIRATORY: ['breathing', 'shortness', 'breath', 'asthma', 'respiratory', 'choking', 'lungs'],
  NEUROLOGICAL: ['headache', 'seizure', 'stroke', 'dizziness', 'consciousness', 'fainting', 'neurological'],
  ALLERGIC: ['allergy', 'allergic', 'reaction', 'anaphylaxis', 'swelling', 'rash', 'itching'],
  GASTROINTESTINAL: ['stomach', 'abdominal', 'vomiting', 'diarrhea', 'nausea', 'digestive', 'appendicitis'],
  PEDIATRIC: ['child', 'baby', 'infant', 'pediatric', 'children', 'birth', 'pregnancy'],
  OBSTETRIC: ['pregnancy', 'pregnant', 'labor', 'contractions', 'water', 'broke', 'birth'],
  BURN: ['burn', 'fire', 'scalding', 'hot', 'burning', 'flame', 'heat'],
  POISONING: ['poison', 'overdose', 'ingestion', 'toxin', 'chemical', 'drug', 'substance'],
  DIABETIC: ['sugar', 'diabetes', 'diabetic', 'insulin', 'hyperglycemia', 'hypoglycemia', 'glucose'],
  MENTAL: ['suicide', 'psychiatric', 'mental', 'psychotic', 'anxiety', 'panic', 'depression']
};

// Urgency keywords
const URGENCY_KEYWORDS = {
  CRITICAL: ['severe', 'extreme', 'unbearable', 'critical', 'life-threatening', 'emergency', 'dying', 'fatal', 'unconscious', 'collapsed', 'not breathing', 'no pulse', 'seizure', 'stroke', 'heart attack'],
  HIGH: ['intense', 'very bad', 'serious', 'urgent', 'worsening', 'acute', 'bleeding', 'unable', 'severe', 'difficulty breathing', 'high fever'],
  MEDIUM: ['moderate', 'concerning', 'uncomfortable', 'persistent', 'ongoing', 'increasing'],
  LOW: ['mild', 'slight', 'minor', 'manageable', 'improved', 'better', 'occasional']
};

// Equipment needed for different conditions
const CONDITION_EQUIPMENT = {
  HEART: ['ECG machine', 'defibrillator', 'cardiac monitor', 'oxygen supply'],
  TRAUMA: ['X-ray machine', 'CT scanner', 'surgical tools', 'blood transfusion equipment'],
  RESPIRATORY: ['ventilator', 'nebulizer', 'oxygen supply', 'bronchoscope'],
  NEUROLOGICAL: ['CT scanner', 'MRI machine', 'EEG machine', 'lumbar puncture kit'],
  ALLERGIC: ['epinephrine auto-injector', 'antihistamines', 'steroids', 'oxygen supply'],
  GASTROINTESTINAL: ['endoscope', 'ultrasound machine', 'colonoscope', 'surgical tools'],
  PEDIATRIC: ['pediatric resuscitation equipment', 'infant incubator', 'child-sized equipment'],
  OBSTETRIC: ['fetal monitor', 'ultrasound machine', 'delivery equipment'],
  BURN: ['burn treatment supplies', 'sterile dressings', 'fluid resuscitation equipment'],
  POISONING: ['gastric lavage equipment', 'activated charcoal', 'dialysis machine'],
  DIABETIC: ['glucose meter', 'insulin', 'fluid resuscitation equipment'],
  MENTAL: ['psychiatric assessment tools', 'restraints', 'sedatives']
};

// Specialists needed for different conditions
const CONDITION_SPECIALISTS = {
  HEART: ['Cardiologist', 'Emergency Medicine Specialist'],
  TRAUMA: ['Trauma Surgeon', 'Orthopedic Surgeon', 'Plastic Surgeon'],
  RESPIRATORY: ['Pulmonologist', 'Emergency Medicine Specialist'],
  NEUROLOGICAL: ['Neurologist', 'Neurosurgeon'],
  ALLERGIC: ['Allergist', 'Immunologist', 'Emergency Medicine Specialist'],
  GASTROINTESTINAL: ['Gastroenterologist', 'General Surgeon'],
  PEDIATRIC: ['Pediatrician', 'Pediatric Surgeon'],
  OBSTETRIC: ['Obstetrician', 'Gynecologist', 'Midwife'],
  BURN: ['Burn Specialist', 'Plastic Surgeon'],
  POISONING: ['Toxicologist', 'Emergency Medicine Specialist'],
  DIABETIC: ['Endocrinologist', 'Emergency Medicine Specialist'],
  MENTAL: ['Psychiatrist', 'Mental Health Specialist']
};

// Dummy conditions in the database (would be replaced with actual database data)
const DUMMY_CONDITIONS = [
  {
    name: 'Heart Attack',
    symptoms: ['chest pain', 'shortness of breath', 'nausea', 'cold sweat', 'fatigue'],
    urgency: 'CRITICAL',
    specialistTypes: ['Cardiologist', 'Emergency Medicine Specialist'],
    requiredEquipment: ['ECG machine', 'defibrillator', 'cardiac monitor', 'oxygen supply']
  },
  {
    name: 'Broken Bone',
    symptoms: ['pain', 'swelling', 'deformity', 'difficulty moving'],
    urgency: 'HIGH',
    specialistTypes: ['Orthopedic Surgeon', 'Emergency Medicine Specialist'],
    requiredEquipment: ['X-ray machine', 'CT scanner', 'casting materials']
  },
  {
    name: 'Asthma Attack',
    symptoms: ['wheezing', 'coughing', 'shortness of breath', 'chest tightness'],
    urgency: 'HIGH',
    specialistTypes: ['Pulmonologist', 'Emergency Medicine Specialist'],
    requiredEquipment: ['nebulizer', 'oxygen supply', 'ventilator']
  },
  {
    name: 'Allergic Reaction',
    symptoms: ['rash', 'hives', 'swelling', 'difficulty breathing', 'itching'],
    urgency: 'HIGH',
    specialistTypes: ['Allergist', 'Emergency Medicine Specialist'],
    requiredEquipment: ['epinephrine auto-injector', 'antihistamines', 'oxygen supply']
  },
  {
    name: 'Food Poisoning',
    symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
    urgency: 'MEDIUM',
    specialistTypes: ['Gastroenterologist', 'Emergency Medicine Specialist'],
    requiredEquipment: ['IV fluids', 'anti-nausea medication']
  }
];

// Analyze medical condition from user text
export async function analyzeMedicalCondition(text) {
  try {
    // Tokenize and stem the input text
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const stemmedTokens = tokens.map(token => stemmer.stem(token));
    
    // Initialize analysis results
    let conditionType = null;
    let highestScore = 0;
    let urgencyLevel = 'MEDIUM'; // Default
    
    // Check for condition matches
    for (const [condition, keywords] of Object.entries(MEDICAL_KEYWORDS)) {
      // Count matching keywords
      const stemmedKeywords = keywords.map(keyword => stemmer.stem(keyword.toLowerCase()));
      
      let score = 0;
      for (const token of stemmedTokens) {
        if (stemmedKeywords.includes(token)) {
          score++;
        }
      }
      
      // Check for exact phrase matches (higher weight)
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        conditionType = condition;
      }
    }
    
    // If no strong condition match, use "GENERAL"
    if (highestScore < 2) {
      conditionType = 'GENERAL';
    }
    
    // Determine urgency level
    for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          urgencyLevel = level;
          break;
        }
      }
    }
    
    // Look for matching condition in database
    // In a real system, this would query the database
    // For now, we'll use the dummy data
    let matchedCondition = null;
    for (const condition of DUMMY_CONDITIONS) {
      let symptomMatches = 0;
      
      for (const symptom of condition.symptoms) {
        if (text.toLowerCase().includes(symptom.toLowerCase())) {
          symptomMatches++;
        }
      }
      
      // If we have a good match (at least 2 symptoms), use this condition
      if (symptomMatches >= 2) {
        matchedCondition = condition;
        break;
      }
    }
    
    // Determine required specialists and equipment
    let requiredSpecialists = [];
    let requiredEquipment = [];
    
    if (matchedCondition) {
      requiredSpecialists = matchedCondition.specialistTypes;
      requiredEquipment = matchedCondition.requiredEquipment;
      urgencyLevel = matchedCondition.urgency; // Override with the matched condition's urgency
    } else if (conditionType && conditionType !== 'GENERAL') {
      requiredSpecialists = CONDITION_SPECIALISTS[conditionType] || [];
      requiredEquipment = CONDITION_EQUIPMENT[conditionType] || [];
    }
    
    return {
      conditionName: matchedCondition ? matchedCondition.name : `${conditionType.toLowerCase()} condition`,
      conditionType,
      urgencyLevel,
      requiredSpecialists,
      requiredEquipment,
      matchScore: highestScore,
      symptoms: matchedCondition ? matchedCondition.symptoms : []
    };
  } catch (error) {
    console.error('Error analyzing medical condition:', error);
    return {
      conditionType: 'GENERAL',
      urgencyLevel: 'MEDIUM',
      requiredSpecialists: ['Emergency Medicine Specialist'],
      requiredEquipment: []
    };
  }
}
