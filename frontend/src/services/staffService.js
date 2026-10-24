import API from './api';

export const getStaff = () => API.get('/staff');
export const createStaff = (data) => API.post('/staff', data);
export const updateStaff = (id, data) => API.put(`/staff/${id}`, data);
export const resetStaffPassword = (id, newPassword) => API.post(`/staff/${id}/reset-password`, { newPassword });
