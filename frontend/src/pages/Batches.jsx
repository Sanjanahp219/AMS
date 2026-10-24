import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Users, X, Edit, Clock, UserCheck } from "lucide-react";
import { getBatches, createBatch, updateBatch, updateBatchStatus } from "../services/batchService";
import { getCourses } from "../services/courseService";
import "./Batches.css";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    batchName: "",
    course: "",
    startDate: "",
    endDate: "",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    instructor: "",
    maxCapacity: 30,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [batchesRes, coursesRes] = await Promise.all([
        getBatches({ search: searchTerm, status: statusFilter }),
        getCourses({ status: "Active" }),
      ]);
      setBatches(batchesRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      console.error("Failed to load batches:", err);
      setError("Unable to load batches from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingBatch(null);
    setFormData({
      batchName: "",
      course: courses.length > 0 ? courses[0]._id : "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      instructor: "",
      maxCapacity: 30,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (batch) => {
    setEditingBatch(batch);
    setFormData({
      batchName: batch.batchName,
      course: batch.course?._id || batch.course,
      startDate: batch.startDate || "",
      endDate: batch.endDate || "",
      startTime: batch.startTime || "09:00 AM",
      endTime: batch.endTime || "11:00 AM",
      instructor: batch.instructor || "",
      maxCapacity: batch.maxCapacity || 30,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBatch) {
        await updateBatch(editingBatch._id, formData);
        alert("Batch updated successfully!");
      } else {
        await createBatch(formData);
        alert("Batch created successfully!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save batch.");
    }
  };

  const handleStatusChange = async (batchId, newStatus) => {
    try {
      await updateBatchStatus(batchId, newStatus);
      fetchData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="batches-container">
      {/* Header */}
      <div className="batches-header">
        <div>
          <h1>Batch Management</h1>
          <p>Organize courses into morning, evening, and weekend batches with seat tracking</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} />
          <span>Create Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="batches-filter-bar">
        <div className="batches-search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by batch name or instructor..."
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
          <option value="Upcoming">Upcoming</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Batches Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading batches...</div>
      ) : batches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
          <Calendar size={40} style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} />
          <h3>No batches found</h3>
          <p>Click "Create Batch" above to schedule a new batch.</p>
        </div>
      ) : (
        <div className="batches-table-wrapper">
          <table className="batches-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Batch Name</th>
                <th>Course</th>
                <th>Schedule</th>
                <th>Instructor</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const enrolled = batch.currentEnrollments || 0;
                const capacity = batch.maxCapacity || 30;
                const percentage = Math.min(100, Math.round((enrolled / capacity) * 100));

                return (
                  <tr key={batch._id}>
                    <td>
                      <span style={{ fontWeight: "600", color: "#4f46e5" }}>{batch.batchId}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>{batch.batchName}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {batch.startDate ? `Starts ${batch.startDate}` : "Flexible start"}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "500" }}>{batch.course?.name || "General Course"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
                        <Clock size={14} color="#64748b" />
                        <span>{batch.startTime} - {batch.endTime}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <UserCheck size={14} color="#64748b" />
                        <span>{batch.instructor || "TBA"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="capacity-container">
                        <div className="capacity-text">
                          <span>{enrolled} / {capacity}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="capacity-bar-bg">
                          <div
                            className="capacity-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: percentage >= 90 ? "#ef4444" : percentage >= 70 ? "#f59e0b" : "#4f46e5",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={batch.status}
                        onChange={(e) => handleStatusChange(batch._id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                          border: "1px solid #cbd5e1",
                          outline: "none",
                        }}
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenEditModal(batch)}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Edit
                      </button>
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
              <h2>{editingBatch ? "Edit Batch" : "Create New Batch"}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MERN Morning Weekday Batch A"
                  value={formData.batchName}
                  onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Associated Course *</label>
                <select
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:00 AM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Instructor / Trainer</label>
                  <input
                    type="text"
                    placeholder="Instructor Name"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBatch ? "Save Changes" : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
