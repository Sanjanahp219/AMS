import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

// Load environment variables (.env)
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'AMS - Academy Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.send('AMS (Academy Management System) API is running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/departments', departmentRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AMS Backend running on http://localhost:${PORT}`);
});

export default app;
