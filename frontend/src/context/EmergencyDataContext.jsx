import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchAllEmergencyData,
  createContact as apiCreateContact,
  updateContact as apiUpdateContact,
  deleteContact as apiDeleteContact,
  createService as apiCreateService,
  deleteService as apiDeleteService,
  updatePatientInfo as apiUpdatePatientInfo
} from '../api/emergency';
import { useAuth } from './AuthContext';

const EmergencyDataContext = createContext();

export function EmergencyDataProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [services, setServices] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  const persistCache = (next) => {
    try {
      if (next.contacts) localStorage.setItem('emergencyContacts', JSON.stringify(next.contacts));
      if (next.services) localStorage.setItem('preferredServices', JSON.stringify(next.services));
      if (next.patientInfo) localStorage.setItem('patientInfo', JSON.stringify(next.patientInfo));
    } catch {}
  };

  const refresh = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllEmergencyData();
      const nextContacts = Array.isArray(data?.contacts) ? data.contacts : [];
      const nextServices = Array.isArray(data?.services) ? data.services : [];
      const nextPatientInfo = data?.patientInfo || {};
      setContacts(nextContacts);
      setServices(nextServices);
      setPatientInfo(nextPatientInfo);
      setLastLoadedAt(new Date().toISOString());
      persistCache({ contacts: nextContacts, services: nextServices, patientInfo: nextPatientInfo });
    } catch (e) {
      setError(e?.message || 'Failed to load emergency data');
      // Fallback to cache
      try {
        const c = localStorage.getItem('emergencyContacts');
        const s = localStorage.getItem('preferredServices');
        const p = localStorage.getItem('patientInfo');
        if (c) setContacts(JSON.parse(c));
        if (s) setServices(JSON.parse(s));
        if (p) setPatientInfo(JSON.parse(p));
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Pre-hydrate from local cache for instant UI while network loads
      try {
        const c = localStorage.getItem('emergencyContacts');
        const s = localStorage.getItem('preferredServices');
        const p = localStorage.getItem('patientInfo');
        if (c) setContacts(JSON.parse(c));
        if (s) setServices(JSON.parse(s));
        if (p) setPatientInfo(JSON.parse(p));
      } catch {}
      // Then fetch fresh data
      refresh();
    } else {
      // Clear in-memory state on logout; keep cache for next login
      setContacts([]);
      setServices([]);
      setPatientInfo({});
      setLastLoadedAt(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Derived helpers
  const preferredAmbulance = useMemo(() => {
    const last = [...services].reverse().find(s => s?.ambulance);
    return last?.ambulance || null;
  }, [services]);

  const preferredHospitalName = useMemo(() => {
    if (patientInfo?.preferredHospital) return patientInfo.preferredHospital;
    const last = [...services].reverse().find(s => s?.hospital);
    return last?.hospital || null;
  }, [services, patientInfo]);

  // Mutations with instant in-memory update and cache sync
  const addContact = async (payload) => {
    const created = await apiCreateContact(payload);
    setContacts((prev) => {
      const next = [...prev, created];
      persistCache({ contacts: next, services, patientInfo });
      return next;
    });
    return created;
  };

  const updateContact = async (id, payload) => {
    const updated = await apiUpdateContact(id, payload);
    setContacts((prev) => {
      const next = prev.map(c => (c._id === id || c.id === id) ? updated : c);
      persistCache({ contacts: next, services, patientInfo });
      return next;
    });
    return updated;
  };

  const deleteContact = async (id) => {
    await apiDeleteContact(id);
    setContacts((prev) => {
      const next = prev.filter(c => (c._id || c.id) !== id);
      persistCache({ contacts: next, services, patientInfo });
      return next;
    });
    return true;
  };

  const addService = async (payload) => {
    const created = await apiCreateService(payload);
    setServices((prev) => {
      const next = [...prev, created];
      persistCache({ contacts, services: next, patientInfo });
      return next;
    });
    return created;
  };

  const deleteService = async (id) => {
    await apiDeleteService(id);
    setServices((prev) => {
      const next = prev.filter(s => (s._id || s.id) !== id);
      persistCache({ contacts, services: next, patientInfo });
      return next;
    });
    return true;
  };

  const savePatientInfo = async (payload) => {
    const saved = await apiUpdatePatientInfo(payload);
    setPatientInfo(saved);
    persistCache({ contacts, services, patientInfo: saved });
    return saved;
  };

  const value = {
    contacts,
    services,
    patientInfo,
    isLoading,
    error,
    lastLoadedAt,
    preferredAmbulance,
    preferredHospitalName,
    refresh,
    addContact,
    updateContact,
    deleteContact,
    addService,
    deleteService,
    savePatientInfo,
  };

  return (
    <EmergencyDataContext.Provider value={value}>
      {children}
    </EmergencyDataContext.Provider>
  );
}

export function useEmergencyData() {
  const ctx = useContext(EmergencyDataContext);
  if (!ctx) throw new Error('useEmergencyData must be used within EmergencyDataProvider');
  return ctx;
}
