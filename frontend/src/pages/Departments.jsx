import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Departments.css";
import { Trash2, Edit, X } from "lucide-react";
import { 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from "../services/departmentService";

export default function Departments() {
  const [department, setDepartment] = useState({
    departmentid: "",
    departmentname: "",
    students: "",
  });

  const [departmentList, setDepartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch departments from MongoDB on page load
  const fetchDepartmentsList = async () => {
    try {
      setLoading(true);
      const res = await getDepartments();
      setDepartmentList(res.data || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsList();
  }, []);

  // 2. Add or Update Department in MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!department.departmentid || !department.departmentname) {
      alert("Please fill out Department ID and Department Name!");
      return;
    }

    try {
      if (isEditing) {
        // UPDATE existing department in MongoDB
        const res = await updateDepartment(department._id, department);
        setDepartmentList(
          departmentList.map((d) => (d._id === department._id ? res.data : d))
        );
        alert("Department updated successfully!");
      } else {
        // CREATE new department in MongoDB
        const res = await createDepartment(department);
        setDepartmentList([res.data, ...departmentList]);
        alert("Department added successfully to MongoDB!");
      }

      // Reset form and close
      setShowForm(false);
      setIsEditing(false);
      setDepartment({ departmentid: "", departmentname: "", students: "" });
    } catch (error) {
      console.error("Error saving department:", error);
      const msg = error.response?.data?.message || "Failed to save department.";
      alert(`Error: ${msg}`);
    }
  };

  // 3. Delete Department from MongoDB
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      await deleteDepartment(id);
      // Remove from UI state immediately
      setDepartmentList(departmentList.filter((d) => d._id !== id));
      alert("Department deleted successfully!");
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department.");
    }
  };

  // 4. Open form for editing
  const handleEdit = (dep) => {
    setDepartment(dep);
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="dtable">
      {/* POPUP MODAL FORM */}
      {showForm && (
        <div className="department-form-container">
          <form className="department-form" onSubmit={handleSubmit} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setDepartment({ departmentid: "", departmentname: "", students: "" });
                setIsEditing(false);
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "#f16363de",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>

            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "22px", textAlign: "center" }}>
              {isEditing ? "Edit Department" : "Add New Department"}
            </h2>

            <div className="form-group">
              <label>Department ID</label>
              <input
                type="text"
                placeholder="e.g. CSE"
                value={department.departmentid}
                onChange={(e) => setDepartment({ ...department, departmentid: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Department Name</label>
              <input
                type="text"
                placeholder="Computer Science & Engineering"
                value={department.departmentname}
                onChange={(e) => setDepartment({ ...department, departmentname: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Students Count</label>
              <input
                type="number"
                placeholder="0"
                value={department.students}
                onChange={(e) => setDepartment({ ...department, students: e.target.value })}
              />
            </div>

            <button type="submit" className="submit-btn">
              {isEditing ? "Update Department" : "Save Department"}
            </button>
          </form>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="deparment-main">
        <div className="deparment-main-content">
          <h1>Departments</h1>
          <p>Manage college departments in MongoDB</p>
        </div>
        <div className="department-right">
          <button
            className="add-button"
            onClick={() => {
              setDepartment({ departmentid: "", departmentname: "", students: "" });
              setIsEditing(false);
              setShowForm(true);
            }}
          >
            + Add Department
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          Loading departments from database...
        </div>
      ) : departmentList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          No departments found. Click "+ Add Department" to create one.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Department ID</th>
              <th>Department Name</th>
              <th>Students</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {departmentList.map((dep) => (
              <tr key={dep._id}>
                <td>{dep.departmentid}</td>
                <td>{dep.departmentname}</td>
                <td>{dep.students}</td>
                <td className="edit">
                  <button title="Edit" onClick={() => handleEdit(dep)}>
                    <Edit size={16} />
                  </button>
                </td>
                <td className="delete">
                  <button title="Delete" onClick={() => handleDelete(dep._id)}>
                    <Trash2 size={16} color="#dc2626" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}