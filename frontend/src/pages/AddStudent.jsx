import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { createStudent } from "../services/studentService";
import "./AddStudent.css";

export default function AddStudent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    city: "",
    emergencyContact: "",
    notes: "",
    status: "Active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage("Student name and phone number are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await createStudent(formData);
      alert("Student registered successfully! A unique Student ID has been generated.");
      navigate("/students");
    } catch (err) {
      console.error("Error creating student:", err);
      setErrorMessage(err.response?.data?.message || "Failed to register student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-student-container" style={{ padding: "30px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/students")}
          className="btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} /> Back to Students
        </button>
      </div>

      <div style={{ backgroundColor: "#ffffff", padding: "26px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "22px", color: "#0f172a" }}>Register New Student</h1>
        <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#64748b" }}>
          Student ID will be assigned automatically (e.g. STU-2026-0001)
        </p>

        {errorMessage && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px", color: "#b91c1c", marginBottom: "16px" }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                name="phone"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Street address / apartment"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                placeholder="Bangalore, Mumbai, etc."
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Emergency Contact Phone</label>
              <input
                type="text"
                name="emergencyContact"
                placeholder="Guardian or family contact"
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Initial Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              rows="3"
              name="notes"
              placeholder="Prior education background, notes, goals..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" className="btn-secondary" onClick={() => navigate("/students")}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Save size={16} />
              <span>{isSubmitting ? "Registering..." : "Register Student"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
