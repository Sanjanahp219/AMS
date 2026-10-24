import React, { useState, useEffect } from "react";
import { Plus, Shield, ShieldCheck, Key, X, Phone, Mail, UserCheck } from "lucide-react";
import { getStaff, createStaff, updateStaff, resetStaffPassword } from "../services/staffService";
import "./Staff.css";

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Staff Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff",
    phone: "",
  });

  // Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStaff();
      setStaffList(res.data || []);
    } catch (err) {
      console.error("Failed to load staff accounts:", err);
      setError(err.response?.data?.message || "Failed to load staff accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createStaff(formData);
      alert("Staff account created successfully!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "Staff", phone: "" });
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create staff account.");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    const confirm = window.confirm(`Change ${user.name}'s status to ${newStatus}?`);
    if (!confirm) return;

    try {
      await updateStaff(user._id, { status: newStatus });
      fetchStaff();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await resetStaffPassword(resetModalUser._id, newPassword);
      alert(`Password successfully updated for ${resetModalUser.name}`);
      setResetModalUser(null);
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="staff-container">
      {/* Header */}
      <div className="staff-header">
        <div>
          <h1>Staff Account Management</h1>
          <p>Administrator control for creating team accounts, assigning roles, and security access</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Staff Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading staff accounts...</div>
      ) : staffList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
          <Shield size={40} style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} />
          <h3>No staff accounts found</h3>
          <p>Click "Add Staff Member" above to create an authorized account.</p>
        </div>
      ) : (
        <div className="staff-grid">
          {staffList.map((user) => (
            <div key={user._id} className="staff-card">
              <div className="staff-card-header">
                <div className="staff-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <h3 className="staff-name">{user.name}</h3>
                  <p className="staff-email">{user.email}</p>
                </div>
              </div>

              <div className="staff-meta-row">
                <span>Role:</span>
                <span style={{ fontWeight: "600", color: user.role === "Admin" ? "#4f46e5" : "#0d9488" }}>
                  {user.role}
                </span>
              </div>

              <div className="staff-meta-row">
                <span>Phone:</span>
                <span>{user.phone || "Not specified"}</span>
              </div>

              <div className="staff-meta-row">
                <span>Status:</span>
                <span className={`badge-tag ${user.status?.toLowerCase()}`}>{user.status}</span>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                <button
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  onClick={() => setResetModalUser(user)}
                >
                  <Key size={14} /> Reset Pass
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleToggleStatus(user)}
                >
                  {user.status === "Active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Staff Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Staff Member</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sundaram"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="priya@amsacademy.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Initial Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button
                onClick={() => setResetModalUser(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 14px 0" }}>
              Enter a new password for <strong>{resetModalUser.name}</strong> ({resetModalUser.email}).
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter at least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setResetModalUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
