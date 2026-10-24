import API from './api';

export const getSettings = () => API.get('/settings');
export const updateSettings = (data) => API.put('/settings', data);
