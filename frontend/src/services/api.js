import axios from 'axios';

// Base API instance for AMS
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT token to requests if user is logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
