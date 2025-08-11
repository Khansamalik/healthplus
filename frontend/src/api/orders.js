import http from './http';

export const createMedicineOrder = (details) => http.post('/orders', { type: 'MEDICINE', details }).then(r => r.data);
export const createLabOrder = (details) => http.post('/orders', { type: 'LAB', details }).then(r => r.data);
export const getMyOrders = () => http.get('/orders').then(r => r.data);
export const updateOrderStatus = (id, status) => http.put(`/orders/${id}/status`, { status }).then(r => r.data);
