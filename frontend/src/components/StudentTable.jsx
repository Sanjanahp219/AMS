import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import './StudentTable.css';

export default function StudentTable({ students = [], onDelete }) {
  const navigate = useNavigate();

  if (students.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        No student records found. Click "+ Register Student" to add a new record.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="student-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>City</th>
            <th>Status</th>
            <th>Profile</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>
                <span style={{ fontWeight: '600', color: '#4f46e5' }}>{student.studentId}</span>
              </td>
              <td className="student-name-col">
                <div className="student-avatar">
                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{student.name}</span>
              </td>
              <td>{student.phone}</td>
              <td>{student.email || '—'}</td>
              <td>{student.city || '—'}</td>
              <td>
                <span className={`badge-status ${(student.status || 'Active').toLowerCase()}`}>
                  {student.status || 'Active'}
                </span>
              </td>

              {/* View Profile Button */}
              <td>
                <button
                  className="action-btn view"
                  title="View Student Profile"
                  onClick={() => navigate(`/student/${student._id}`)}
                >
                  <Eye size={18} color="#4f46e5" />
                </button>
              </td>

              {/* Edit Button */}
              <td>
                <button
                  className="action-btn edit"
                  title="Edit Student"
                  onClick={() => navigate(`/edit-student/${student._id}`)}
                >
                  <Edit size={18} color="#059669" />
                </button>
              </td>

              {/* Delete Button */}
              <td>
                <button
                  className="action-btn delete"
                  title="Delete Student"
                  onClick={() => onDelete(student._id)}
                >
                  <Trash2 size={18} color="#dc2626" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
