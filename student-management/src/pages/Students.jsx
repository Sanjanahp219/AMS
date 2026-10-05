
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import StudentTable from '../components/StudentTable';
import { students as initialStudents } from '../data/students';
import './Students.css';
import React, { useState, useEffect } from 'react';


export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentsData, setStudentsData] = useState(() => {
    try {
      const savedData = localStorage.getItem("studentData");
      if (!savedData) return initialStudents;
      
      const parsed = JSON.parse(savedData);
      // Safety check: only load students that have an actual 'id'
      const validStudents = parsed.filter(s => s && s.id);
      
      return validStudents.length > 0 ? validStudents : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  useEffect(()=>{
    localStorage.setItem("studentData", JSON.stringify(studentsData))
  },[studentsData])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'edit' or 'view'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleDelete = (studentId) => {
    const updatedStudents = studentsData.filter(student => student.id !== studentId);
    setStudentsData(updatedStudents);
  }

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setModalMode('view');
    setIsModalOpen(true);
  }

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditFormData(student);
    setModalMode('edit');
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  }

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  }

  const handleSave = () => {
    const updatedStudents = studentsData.map(student => 
      student.id === editFormData.id ? editFormData : student
    );
    setStudentsData(updatedStudents);
    closeModal();
  }




  return (
    <div className="students-page-container">
      <div className="students-header">
        <h1>Students</h1>
        <p>Manage and view all student records</p>
      </div>

      <div className="table-card">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={18} color="#6b7280" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/add-student" className="btn-primary">
            <Plus size={18} />
            Add Student
          </Link>
        
            

        
        </div>

        {/* Filters */}
        <div className="table-filters">
          <select className="filter-select">
            <option>Department</option>
            <option>CSE</option>
            <option>ECE</option>
            <option>ISE</option>
          </select>
          <select className="filter-select">
            <option>Course</option>
            <option>Computer Science</option>
            <option>Electronics</option>
            <option>Information Science</option>
          </select>
          <select className="filter-select">
            <option>Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Table Component */}
        <StudentTable 
          students={studentsData} 
          onDelete={handleDelete}
          onEdit={openEditModal}
          onView={openViewModal}
        />
      </div>

      {/* MODAL POPUP */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'edit' ? 'Edit Student' : 'Student Details'}</h2>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              {modalMode === 'view' ? (
                <div className="view-details">
                  <div className="detail-row">
                    <span className="detail-label">Student ID</span>
                    <span className="detail-value">{selectedStudent?.studentId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{selectedStudent?.fullName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{selectedStudent?.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Course</span>
                    <span className="detail-value">{selectedStudent?.course}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Department</span>
                    <span className="detail-value">{selectedStudent?.department}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">
                      <span className={`badge-status ${selectedStudent?.status?.toLowerCase()}`}>
                        {selectedStudent?.status}
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="modal-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={editFormData.name || ''} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={editFormData.email || ''} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>Course</label>
                    <input type="text" name="course" value={editFormData.course || ''} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" name="department" value={editFormData.department || ''} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={editFormData.status || ''} onChange={handleEditChange}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button onClick={closeModal} className="btn-secondary">Cancel</button>
                    <button onClick={handleSave} className="btn-primary">Save Changes</button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
