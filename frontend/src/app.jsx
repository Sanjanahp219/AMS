import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import AddStudent from './pages/AddStudent.jsx';
import EditStudent from './pages/EditStudent.jsx';
import ViewStudent from './pages/ViewStudent.jsx';
import Courses from './pages/Courses.jsx';
import Batches from './pages/Batches.jsx';
import Enrollments from './pages/Enrollments.jsx';
import Payments from './pages/Payments.jsx';
import Reports from './pages/Reports.jsx';
import Staff from './pages/Staff.jsx';
import Settings from './pages/Settings.jsx';
import Departments from './pages/Departments.jsx';
import LoginForm from './pages/LoginForm.jsx';

import './app.css';

function AppContent() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isAuthPage = path === '/login' || path === '/loginform';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // If on login page, render full screen without Navbar and Sidebar
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/loginform" element={<LoginForm />} />
      </Routes>
    );
  }

  // Authenticated layout with Navbar, Sidebar, and Protected Routes
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="main-content">
        <Routes>
          {/* Root redirect: if logged in -> dashboard, else -> login */}
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-student"
            element={
              <ProtectedRoute>
                <AddStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-student/:id"
            element={
              <ProtectedRoute>
                <EditStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/:id"
            element={
              <ProtectedRoute>
                <ViewStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches"
            element={
              <ProtectedRoute>
                <Batches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enrollments"
            element={
              <ProtectedRoute>
                <Enrollments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <Departments />
              </ProtectedRoute>
            }
          />
          {/* Any unknown route redirects home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
