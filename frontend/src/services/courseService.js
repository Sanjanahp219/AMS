import API from './api';

export const getCourses = (params) => API.get('/courses', { params });
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const updateCourseStatus = (id, status) => API.patch(`/courses/${id}/status`, { status });
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
