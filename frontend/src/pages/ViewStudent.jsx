import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Mail, Phone, Calendar, MapPin, ClipboardList, CreditCard } from "lucide-react";
import { getStudentById } from "../services/studentService";
import "./ViewStudent.css";

export default function ViewStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getStudentById(id);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load student profile:", err);
        setError("Student profile could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudentProfile();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading profile...</div>;
  }

  if (error || !data?.student) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#dc2626" }}>{error || "Student not found."}</p>
        <button className="btn-secondary" onClick={() => navigate("/students")}>
          Back to Students
        </button>
      </div>
    );
  }

  const { student, enrollments = [], payments = [] } = data;

  return (
    <div className="profile-container">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate("/students")}
          className="btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} /> Back to Students
        </button>
      </div>

      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-avatar-info">
          <div className="profile-big-avatar">{student.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="profile-name">{student.name}</h1>
            <div className="profile-id-tag">
              ID: <strong>{student.studentId}</strong> • Registered: {new Date(student.registrationDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className={`badge-tag ${student.status?.toLowerCase()}`}>{student.status}</span>
          <Link
            to={`/edit-student/${student._id}`}
            className="btn-primary"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Edit size={16} /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Grid: Personal details on left, Enrollments & Payments on right */}
      <div className="profile-grid-2col">
        {/* Left Column: Personal Info */}
        <div>
          <div className="profile-card">
            <h3>Personal Information</h3>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{student.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{student.email || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{student.dateOfBirth || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Gender</span>
              <span className="info-value">{student.gender || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">City</span>
              <span className="info-value">{student.city || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-value">{student.address || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Emergency Contact</span>
              <span className="info-value">{student.emergencyContact || "—"}</span>
            </div>
            {student.notes && (
              <div className="info-row" style={{ flexDirection: "column", gap: "4px" }}>
                <span className="info-label">Notes</span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{student.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Course Enrollments & Fee Payments */}
        <div>
          {/* Enrollments */}
          <div className="profile-card">
            <h3>Course Enrollments ({enrollments.length})</h3>
            {enrollments.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No courses enrolled yet.</p>
            ) : (
              <table className="enrollments-table" style={{ fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>Enrollment ID</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Total Fee</th>
                    <th>Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr) => (
                    <tr key={enr._id}>
                      <td><strong>{enr.enrollmentId}</strong></td>
                      <td>{enr.course?.name}</td>
                      <td>{enr.batch?.batchName || "N/A"}</td>
                      <td>₹{enr.finalPayable?.toLocaleString("en-IN")}</td>
                      <td style={{ color: "#15803d", fontWeight: "600" }}>₹{(enr.paidAmount || 0).toLocaleString("en-IN")}</td>
                      <td><span className={`badge-tag ${enr.status?.toLowerCase()}`}>{enr.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Payments */}
          <div className="profile-card">
            <h3>Fee & Payment History ({payments.length})</h3>
            {payments.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No payments recorded yet.</p>
            ) : (
              <table className="enrollments-table" style={{ fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Amount Paid</th>
                    <th>Method</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.receiptNumber}</strong></td>
                      <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td style={{ color: "#15803d", fontWeight: "700" }}>₹{p.amount?.toLocaleString("en-IN")}</td>
                      <td><span className="badge-tag active">{p.paymentMethod}</span></td>
                      <td>{p.referenceNumber || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
