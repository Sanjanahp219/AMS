import API from './api';

export const getEnrollments = (params) => API.get('/enrollments', { params });
export const getEnrollmentById = (id) => API.get(`/enrollments/${id}`);
export const createEnrollment = (data) => API.post('/enrollments', data);
export const updateEnrollment = (id, data) => API.put(`/enrollments/${id}`, data);
export const updateEnrollmentStatus = (id, status) => API.patch(`/enrollments/${id}/status`, { status });
