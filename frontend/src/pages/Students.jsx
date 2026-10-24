import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users } from 'lucide-react';
import StudentTable from '../components/StudentTable';
import { getStudents, deleteStudent } from '../services/studentService';
import './Students.css';

export default function Students() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 1. Fetch Students from MongoDB on component mount
  const fetchStudentsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudents({ search: searchTerm, status: statusFilter });
      setStudentsData(res.data || []);
    } catch (err) {
      console.error("Failed to load students:", err);
      setError("Unable to connect to backend server. Make sure your server is running on http://localhost:5000");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsList();
  }, [searchTerm, statusFilter]);

  // 2. Delete Student from MongoDB
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student record?");
    if (!confirmDelete) return;

    try {
      await deleteStudent(id);
      setStudentsData((prev) => prev.filter((student) => student._id !== id));
      alert("Student deleted successfully!");
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Failed to delete student from database.");
    }
  };

  return (
    <div className="students-page-container">
      <div className="students-header">
        <div>
          <h1>Student Directory</h1>
          <p>Search, manage profiles, enrollments, and status of all academy students</p>
        </div>
        <Link to="/add-student" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          <span>Register Student</span>
        </Link>
      </div>

      <div className="table-card">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search by student name, phone, email, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Students</option>
            <option value="Inactive">Inactive Students</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", color: "#b91c1c", margin: "16px" }}>
            {error}
          </div>
        )}

        {/* Student List Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading students...</div>
        ) : (
          <StudentTable
            students={studentsData}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
