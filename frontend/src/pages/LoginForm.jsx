import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, User, GraduationCap, Eye, EyeOff } from 'lucide-react';
import './LoginForm.css';

export default function LoginForm() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (isSignUp && !formData.name) {
      setError('Please enter your full name.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const endpoint = isSignUp
        ? 'http://localhost:5000/api/auth/register'
        : 'http://localhost:5000/api/auth/login';

      const payload = isSignUp
        ? { name: formData.name, email: formData.email, password: formData.password, role: 'Staff' }
        : { email: formData.email, password: formData.password };

      const res = await axios.post(endpoint, payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(res.data.user));

      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Logins
  const handleQuickFill = (email, password) => {
    setFormData({ ...formData, email, password });
    setIsSignUp(false);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-box" style={{ background: '#4f46e5', color: '#ffffff' }}>
            <GraduationCap size={28} />
          </div>
          <h1 className="login-title">AMS Management</h1>
          <p className="login-subtitle">Academy Management System Portal</p>
        </div>

        {/* Tab Switcher */}
        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); setError(''); }}
          >
            Register Staff
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@amsacademy.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Staff Account' : 'Sign In to AMS'}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px' }}>
          <div style={{ fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Demo System Accounts (Click to Fill):
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@ams.edu', 'admin123')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600',
                color: '#4f46e5',
              }}
            >
              Admin (admin@ams.edu)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff@ams.edu', 'staff123')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600',
                color: '#0d9488',
              }}
            >
              Staff (staff@ams.edu)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
