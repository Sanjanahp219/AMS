import React, { useState, useEffect } from "react";
import { Plus, Search, ClipboardList, CheckCircle, Clock, X, AlertCircle } from "lucide-react";
import { getEnrollments, createEnrollment, updateEnrollmentStatus } from "../services/enrollmentService";
import { getStudents } from "../services/studentService";
import { getCourses } from "../services/courseService";
import { getBatches } from "../services/batchService";
import "./Enrollments.css";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    batchId: "",
    agreedFee: 0,
    discount: 0,
    status: "Active",
    notes: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [enrollRes, studRes, courseRes, batchRes] = await Promise.all([
        getEnrollments({ search: searchTerm, status: statusFilter }),
        getStudents({ status: "Active" }),
        getCourses({ status: "Active" }),
        getBatches({ status: "Active" }),
      ]);
      setEnrollments(enrollRes.data || []);
      setStudents(studRes.data || []);
      setCourses(courseRes.data || []);
      setBatches(batchRes.data || []);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
      setError("Unable to load enrollments from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  const handleOpenModal = () => {
    const defaultCourse = courses[0] || null;
    setFormData({
      studentId: students.length > 0 ? students[0]._id : "",
      courseId: defaultCourse ? defaultCourse._id : "",
      batchId: "",
      agreedFee: defaultCourse ? defaultCourse.courseFee : 0,
      discount: 0,
      status: "Active",
      notes: "",
    });
    setIsModalOpen(true);
  };

  // When user changes course, auto-update default agreedFee
  const handleCourseChange = (courseId) => {
    const selected = courses.find((c) => c._id === courseId);
    setFormData({
      ...formData,
      courseId,
      batchId: "", // reset batch
      agreedFee: selected ? selected.courseFee : 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEnrollment(formData);
      alert("Student enrolled successfully!");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create enrollment.");
    }
  };

  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      await updateEnrollmentStatus(enrollmentId, newStatus);
      fetchData();
    } catch (err) {
      alert("Failed to update enrollment status.");
    }
  };

  // Available batches for selected course
  const availableBatches = batches.filter((b) => (b.course?._id || b.course) === formData.courseId);

  const calculatedFinal = Math.max(0, (Number(formData.agreedFee) || 0) - (Number(formData.discount) || 0));

  return (
    <div className="enrollments-container">
      {/* Header */}
      <div className="enrollments-header">
        <div>
          <h1>Student Enrollments</h1>
          <p>Link registered students to courses, assign batches, and configure fees</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <Plus size={18} />
          <span>New Enrollment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="enrollments-filter-bar">
        <div className="enrollments-search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by student, ID, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="courses-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading enrollments...</div>
      ) : enrollments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
          <ClipboardList size={40} style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} />
          <h3>No enrollments found</h3>
          <p>Click "New Enrollment" above to enroll a student in a course.</p>
        </div>
      ) : (
        <div className="enrollments-table-wrapper">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Enrollment ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Fee Summary</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr) => {
                const paid = Number(enr.paidAmount) || 0;
                const total = Number(enr.finalPayable) || 0;
                const balance = Math.max(0, total - paid);

                return (
                  <tr key={enr._id}>
                    <td>
                      <span style={{ fontWeight: "600", color: "#4f46e5" }}>{enr.enrollmentId}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>{enr.student?.name || "Student"}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{enr.student?.studentId} • {enr.student?.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "500" }}>{enr.course?.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{enr.course?.code}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: enr.batch ? "#0f172a" : "#94a3b8" }}>
                        {enr.batch?.batchName || "Unassigned"}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>₹{total.toLocaleString("en-IN")}</div>
                      {enr.discount > 0 && (
                        <div style={{ fontSize: "11px", color: "#16a34a" }}>
                          (₹{enr.discount.toLocaleString("en-IN")} off)
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ color: "#15803d", fontWeight: "600" }}>
                        ₹{paid.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: balance > 0 ? "#dc2626" : "#64748b", fontWeight: balance > 0 ? "700" : "400" }}>
                        ₹{balance.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <select
                        value={enr.status}
                        onChange={(e) => handleStatusChange(enr._id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                          border: "1px solid #cbd5e1",
                          outline: "none",
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>
                      {new Date(enr.enrollmentDate).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Enroll Student in Course</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Student *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentId} - {s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code} - Standard Fee: ₹{c.courseFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assign Batch (Optional)</label>
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                >
                  <option value="">-- No Batch / Self-Paced --</option>
                  {availableBatches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.batchName} ({b.startTime} - {b.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Agreed Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.agreedFee}
                    onChange={(e) => setFormData({ ...formData, agreedFee: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Discount Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Final Payable Amount: </span>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#4f46e5" }}>
                  ₹{calculatedFinal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="form-group">
                <label>Notes (e.g. Scholarship, Referral, Installment terms)</label>
                <input
                  type="text"
                  placeholder="Additional enrollment details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
