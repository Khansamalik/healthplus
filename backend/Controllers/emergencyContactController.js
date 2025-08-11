import EmergencyContact from '../models/EmergencyContact.js';
import PreferredService from '../models/PreferredService.js';
import PatientInfo from '../models/PatientInfo.js';

//  EMERGENCY CONTACTS ====================

// Create a new emergency contact
export const createContact = async (req, res) => {
  try {
    const { name, number } = req.body;
    const userId = req.user.id; // Assuming middleware adds user to req

    if (!name || !number) {
      return res.status(400).json({ message: 'Name and number are required' });
    }

    const contact = await EmergencyContact.create({
      name,
      number,
      userId
    });
    
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all contacts for the logged-in user
export const getUserContacts = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming middleware adds user to req
    const contacts = await EmergencyContact.find({ userId });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update contact by ID
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number } = req.body;
    const userId = req.user.id; // Assuming middleware adds user to req

    // Ensure user owns this contact
    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    if (contact.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this contact' });
    }

    const updatedContact = await EmergencyContact.findByIdAndUpdate(
      id,
      { name, number },
      { new: true }
    );
    
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete contact by ID
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming middleware adds user to req

    // Ensure user owns this contact
    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    if (contact.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this contact' });
    }

    await EmergencyContact.findByIdAndDelete(id);
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PREFERRED SERVICES 

// Create a preferred service
export const createService = async (req, res) => {
  try {
    const { hospital, ambulance } = req.body;
    const userId = req.user.id; // Assuming middleware adds user to req

    if (!hospital && !ambulance) {
      return res.status(400).json({ message: 'At least one service (hospital or ambulance) is required' });
    }

    const service = await PreferredService.create({
      hospital,
      ambulance,
      userId
    });
    
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all services for the logged-in user
export const getUserServices = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming middleware adds user to req
    const services = await PreferredService.find({ userId });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete service by ID
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming middleware adds user to req

    // Ensure user owns this service
    const service = await PreferredService.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    if (service.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await PreferredService.findByIdAndDelete(id);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PATIENT INFO ====================

// Create or update patient info
export const updatePatientInfo = async (req, res) => {
  try {
    const { name, bloodGroup, medicalHistory, preferredHospital, additionalComments } = req.body;
    const userId = req.user.id; // Assuming middleware adds user to req

    // First, try to find existing patient info for this user
    let patientInfo = await PatientInfo.findOne({ userId });

    if (patientInfo) {
      // Update existing info
      patientInfo = await PatientInfo.findOneAndUpdate(
        { userId },
        { name, bloodGroup, medicalHistory, preferredHospital, additionalComments },
        { new: true }
      );
    } else {
      // Create new info
      patientInfo = await PatientInfo.create({
        userId,
        name,
        bloodGroup,
        medicalHistory,
        preferredHospital,
        additionalComments
      });
    }
    
    res.status(200).json(patientInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get patient info for the logged-in user
export const getPatientInfo = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming middleware adds user to req
    const patientInfo = await PatientInfo.findOne({ userId });
    
    if (!patientInfo) {
      return res.status(404).json({ message: 'Patient info not found' });
    }
    
    res.status(200).json(patientInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== COMPLETE EMERGENCY DATA ====================

// Get all emergency data for the logged-in user
export const getAllEmergencyData = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming middleware adds user to req
    
    const contacts = await EmergencyContact.find({ userId });
    const services = await PreferredService.find({ userId });
    const patientInfo = await PatientInfo.findOne({ userId }) || {};
    
    res.status(200).json({
      contacts,
      services,
      patientInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
