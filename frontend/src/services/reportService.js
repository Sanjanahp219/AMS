import API from './api';

export const getStudentsReport = (params) => API.get('/reports/students', { params });
export const getEnrollmentsReport = (params) => API.get('/reports/enrollments', { params });
export const getPaymentsReport = (params) => API.get('/reports/payments', { params });
export const getOutstandingReport = (params) => API.get('/reports/outstanding', { params });

// Helper to trigger browser CSV file download
export const downloadReportCSV = (reportType, params = {}) => {
  const query = new URLSearchParams({ ...params, format: 'csv' }).toString();
  window.open(`http://localhost:5000/api/reports/${reportType}?${query}`, '_blank');
};
