import API from './api';

// 1. Fetch students (with search & status filter)
export const getStudents = (params) => API.get('/students', { params });

// 2. Fetch student profile by ID
export const getStudentById = (id) => API.get(`/students/${id}`);

// 3. Create student
export const createStudent = (studentData) => API.post('/students', studentData);

// 4. Update student
export const updateStudent = (id, studentData) => API.put(`/students/${id}`, studentData);

// 5. Update student status
export const updateStudentStatus = (id, status) => API.patch(`/students/${id}/status`, { status });

// 6. Delete student
export const deleteStudent = (id) => API.delete(`/students/${id}`);
