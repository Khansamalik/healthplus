// frontend/src/api/emergency.js

import http from './http';

// ==================== EMERGENCY CONTACTS ====================

export const fetchContacts = async () => {
  try {
  const response = await http.get('/emergency/contacts');
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const createContact = async (contactData) => {
  try {
    
    console.log('Creating contact with data:', contactData);
  const response = await http.post('/emergency/contacts', contactData);
    console.log('Contact created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating contact:', error.response?.data || error.message);
    throw error;
  }
};

export const updateContact = async (id, contactData) => {
  try {
    
    console.log(`Updating contact ${id} with data:`, contactData);
  const response = await http.put(`/emergency/contacts/${id}`, contactData);
    console.log('Contact updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating contact:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
  const response = await http.delete(`/emergency/contacts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// ==================== PREFERRED SERVICES ====================

export const fetchServices = async () => {
  try {
  const response = await http.get('/emergency/services');
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const createService = async (serviceData) => {
  try {
  const response = await http.post('/emergency/services', serviceData);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const deleteService = async (id) => {
  try {
  const response = await http.delete(`/emergency/services/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// ==================== PATIENT INFO ====================

export const fetchPatientInfo = async () => {
  try {
  const response = await http.get('/emergency/patient-info');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // No patient info exists yet, return empty object
      return {};
    }
    console.error('Error fetching patient info:', error);
    throw error;
  }
};

export const updatePatientInfo = async (patientData) => {
  try {
  // Backend expects PUT /emergency/patient-info
  const response = await http.put('/emergency/patient-info', patientData);
    return response.data;
  } catch (error) {
    console.error('Error updating patient info:', error);
    throw error;
  }
};

// ==================== COMPLETE DATA ====================

export const fetchAllEmergencyData = async () => {
  try {
  const response = await http.get('/emergency/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all emergency data:', error);
    throw error;
  }
};
