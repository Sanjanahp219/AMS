import React, { useState, useEffect } from "react";
import { Plus, Search, BookOpen, Clock, Users, X, Edit, Archive, CheckCircle } from "lucide-react";
import { getCourses, createCourse, updateCourse, updateCourseStatus } from "../services/courseService";
import "./Courses.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration: 12,
    durationUnit: "Weeks",
    courseFee: 30000,
    category: "Software",
    description: "",
  });

  // 1. Fetch courses from backend
  const fetchCoursesList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCourses({ search: searchTerm, status: statusFilter });
      setCourses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Unable to load courses. Please check that backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesList();
  }, [searchTerm, statusFilter]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      name: "",
      code: "",
      duration: 12,
      durationUnit: "Weeks",
      courseFee: 30000,
      category: "Software",
      description: "",
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      duration: course.duration,
      durationUnit: course.durationUnit,
      courseFee: course.courseFee,
      category: course.category || "General",
      description: course.description || "",
    });
    setIsModalOpen(true);
  };

  // Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, formData);
        alert("Course updated successfully!");
      } else {
        await createCourse(formData);
        alert("Course created successfully!");
      }
      setIsModalOpen(false);
      fetchCoursesList();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save course.");
    }
  };

  // Toggle Archive Status
  const handleToggleStatus = async (course) => {
    const newStatus = course.status === "Active" ? "Archived" : "Active";
    const confirm = window.confirm(`Are you sure you want to change status of "${course.name}" to ${newStatus}?`);
    if (!confirm) return;

    try {
      await updateCourseStatus(course._id, newStatus);
      fetchCoursesList();
    } catch (err) {
      alert("Failed to update course status.");
    }
  };

  return (
    <div className="courses-container">
      {/* Header */}
      <div className="courses-header">
        <div>
          <h1>Course Management</h1>
          <p>Create, manage fees, schedules, and monitor course enrollments</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} />
          <span>Add Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="courses-filter-bar">
        <div className="courses-search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by course name or code..."
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
          <option value="Active">Active Courses</option>
          <option value="Archived">Archived Courses</option>
        </select>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Courses Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading courses...</div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
          <BookOpen size={40} style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} />
          <h3>No courses found</h3>
          <p>Click "Add Course" above to create your academy's first course.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <div>
                <div className="course-card-top">
                  <span className="course-code-badge">{course.code}</span>
                  <span className={`badge-tag ${course.status?.toLowerCase()}`}>
                    {course.status}
                  </span>
                </div>
                <h3>{course.name}</h3>
                <p>{course.description || "No description provided."}</p>
              </div>

              <div>
                <div className="course-meta-row">
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={14} /> {course.duration} {course.durationUnit}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Users size={14} /> {course.enrollmentCount || 0} Enrolled
                  </span>
                </div>

                <div className="course-meta-row" style={{ marginTop: "6px" }}>
                  <span>Course Fee:</span>
                  <span className="course-meta-fee">₹{Number(course.courseFee).toLocaleString("en-IN")}</span>
                </div>

                <div className="course-actions">
                  <button className="btn-secondary" onClick={() => handleOpenEditModal(course)}>
                    <Edit size={14} style={{ display: "inline", marginRight: "4px" }} /> Edit
                  </button>
                  <button className="btn-secondary" onClick={() => handleToggleStatus(course)}>
                    {course.status === "Active" ? (
                      <>
                        <Archive size={14} style={{ display: "inline", marginRight: "4px" }} /> Archive
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} style={{ display: "inline", marginRight: "4px" }} /> Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCourse ? "Edit Course" : "Create New Course"}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Web Development"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FS-MERN-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Software, Design, AI"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Duration Unit</label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                  >
                    <option value="Weeks">Weeks</option>
                    <option value="Months">Months</option>
                    <option value="Days">Days</option>
                    <option value="Hours">Hours</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Course Fee (INR ₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.courseFee}
                  onChange={(e) => setFormData({ ...formData, courseFee: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Overview of syllabus, prerequisites, and learning goals..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
