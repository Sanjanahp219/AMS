import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { getStudentById, updateStudent } from "../services/studentService";
import "./AddStudent.css";

export default function EditStudent() {
  const { id } = useParams();
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

  const [studentIdTag, setStudentIdTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await getStudentById(id);
        const s = res.data?.student || res.data;
        if (s) {
          setStudentIdTag(s.studentId || "");
          setFormData({
            name: s.name || "",
            phone: s.phone || "",
            email: s.email || "",
            dateOfBirth: s.dateOfBirth || "",
            gender: s.gender || "Male",
            address: s.address || "",
            city: s.city || "",
            emergencyContact: s.emergencyContact || "",
            notes: s.notes || "",
            status: s.status || "Active",
          });
        }
      } catch (err) {
        console.error("Error loading student:", err);
        setErrorMessage("Failed to load student details.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await updateStudent(id, formData);
      alert("Student updated successfully!");
      navigate(`/student/${id}`);
    } catch (err) {
      console.error("Error updating student:", err);
      setErrorMessage(err.response?.data?.message || "Failed to update student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading student details...</div>;
  }

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
        <h1 style={{ margin: "0 0 4px 0", fontSize: "22px", color: "#0f172a" }}>Edit Student Profile</h1>
        <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#64748b" }}>
          Student ID: <strong>{studentIdTag}</strong>
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
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
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
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
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
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              rows="3"
              name="notes"
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
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
