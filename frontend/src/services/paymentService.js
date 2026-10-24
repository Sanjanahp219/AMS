import API from './api';

export const getPayments = (params) => API.get('/payments', { params });
export const getPaymentsByEnrollment = (enrollmentId) => API.get(`/payments/enrollment/${enrollmentId}`);
export const recordPayment = (data) => API.post('/payments', data);
export const updatePaymentStatus = (id, data) => API.patch(`/payments/${id}/status`, data);
