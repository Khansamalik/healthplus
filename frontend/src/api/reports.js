import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const createAuthInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
};

export const uploadReport = async (file, { description = '', tags = [] } = {}) => {
  const api = createAuthInstance();
  const form = new FormData();
  form.append('file', file);
  if (description) form.append('description', description);
  if (tags && tags.length) form.append('tags', tags.join(','));
  const res = await api.post('/reports', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
};

export const listReports = async () => {
  const api = createAuthInstance();
  const res = await api.get('/reports');
  return res.data;
};

export const updateReport = async (id, data) => {
  const api = createAuthInstance();
  const res = await api.put(`/reports/${id}`, data);
  return res.data;
};

export const deleteReport = async (id) => {
  const api = createAuthInstance();
  const res = await api.delete(`/reports/${id}`);
  return res.data;
};
