import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const createInstance = (auth = false) => {
  const headers = {};
  if (auth) {
    const token = localStorage.getItem('token');
    headers['Authorization'] = token ? `Bearer ${token}` : '';
  }
  return axios.create({ baseURL: API_URL, headers });
};

// Authenticated: ensure or create a code
export const ensureIceCode = async () => {
  const api = createInstance(true);
  const res = await api.post('/ice/ensure');
  return res.data; // { code, userId }
};

// Public: get minimal data by code
export const getIcePublic = async (code) => {
  const api = createInstance(false);
  const res = await api.get(`/ice/public/${code}`);
  return res.data;
};

// Public: request full access
export const requestFullHistory = async (code, requester) => {
  const api = createInstance(false);
  const res = await api.post(`/ice/public/${code}/request-full`, { requester });
  return res.data; // { status: 'pending', approvalToken }
};

// Public: approval landing
export const approveAccess = async (token) => {
  const api = createInstance(false);
  const res = await api.get(`/ice/approve/${token}`);
  return res.data; // { contacts, services, patientInfo }
};
