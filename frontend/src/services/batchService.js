import API from './api';

export const getBatches = (params) => API.get('/batches', { params });
export const getBatchById = (id) => API.get(`/batches/${id}`);
export const createBatch = (data) => API.post('/batches', data);
export const updateBatch = (id, data) => API.put(`/batches/${id}`, data);
export const updateBatchStatus = (id, status) => API.patch(`/batches/${id}/status`, { status });
export const deleteBatch = (id) => API.delete(`/batches/${id}`);
