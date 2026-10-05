import React, { useState } from "react";
import './AddStudent.css';
import { useNavigate } from "react-router-dom";
import { students as initialStudents } from '../data/students.js';
// import React, { useState, useEffect } from 'react';


const AddStudent = () =>{
  
   const navigate = useNavigate();

    const [formData, setFormData] = useState({
        studentId:'',
        fullName:'',
        email:'',
        phone:'',
        dateOfBirth: "",
        gender: "",
        department: "",
        course: "",
        admissionYear: "",
        semester: "",
        address: "",
        city: "",
        state: "",
        status: "Active",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const{name, value} = e.target;
        setFormData({
            ...formData,
         [name]: value,
        });
        
        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    }

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        
        if (!formData.phone.trim()) newErrors.phone = "Phone Number is required";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required";
        if (!formData.gender) newErrors.gender = "Please select a gender";
        
        if (!formData.department) newErrors.department = "Please select a department";
        if (!formData.course) newErrors.course = "Please select a course";
        if (!formData.admissionYear) newErrors.admissionYear = "Please select an admission year";
        if (!formData.semester) newErrors.semester = "Please select a semester";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
          const savedData = localStorage.getItem("studentData");
          const existingStudents = savedData ? JSON.parse(savedData): initialStudents;

          // Translator block to match the table's properties
          const newStudent = {
            ...formData,
            id: formData.studentId,
            name: formData.fullName
          };

          const updatedStudents = [...existingStudents, newStudent];
          localStorage.setItem("studentData", JSON.stringify(updatedStudents));

          setFormData({
            studentId: '',
            fullName: '',
            email: '',
            phone: '',
            dateOfBirth: "",
            gender: "",
            department: "",
            course: "",
            admissionYear: "",
            semester: "",
            address: "",
            city: "",
            state: "",
            status: "Active",
          });
          setErrors({});
          console.log("Form Data Submitted: ", formData);
          alert("Student added successfully!");
          navigate("/students");
        }
    }

    return (
    <div className="add-student-page">
      <div className="page-header">
        <h1>Add Student</h1>
        <p>Create a new student record in the system.</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="student-form">

          {/* Personal Information */}
          <section className="form-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Student ID</label>
                <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="e.g. STU001" className={errors.studentId ? 'input-error' : ''} />
                {errors.studentId && <span className="error-text">{errors.studentId}</span>}
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className={errors.fullName ? 'input-error' : ''} />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className={errors.email ? 'input-error' : ''} />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" className={errors.phone ? 'input-error' : ''} />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={errors.dateOfBirth ? 'input-error' : ''} />
                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={errors.gender ? 'input-error' : ''}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>
            </div>
          </section>

          <hr className="divider" />

          {/* Academic Information */}
          <section className="form-section">
            <h2 className="section-title">Academic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Department</label>
                <select name="department" value={formData.department} onChange={handleChange} className={errors.department ? 'input-error' : ''}>
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics</option>
                  <option value="ISE">Information Science</option>
                  <option value="ME">Mechanical</option>
                </select>
                {errors.department && <span className="error-text">{errors.department}</span>}
              </div>
              <div className="form-group">
                <label>Course</label>
                <select name="course" value={formData.course} onChange={handleChange} className={errors.course ? 'input-error' : ''}>
                  <option value="">Select Course</option>
                  <option value="B.E">B.E</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MCA">MCA</option>
                </select>
                {errors.course && <span className="error-text">{errors.course}</span>}
              </div>
              <div className="form-group">
                <label>Admission Year</label>
                <select name="admissionYear" value={formData.admissionYear} onChange={handleChange} className={errors.admissionYear ? 'input-error' : ''}>
                  <option value="">Select Year</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
                {errors.admissionYear && <span className="error-text">{errors.admissionYear}</span>}
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className={errors.semester ? 'input-error' : ''}>
                  <option value="">Select Semester</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                  <option value="7">7th Semester</option>
                  <option value="8">8th Semester</option>
                </select>
                {errors.semester && <span className="error-text">{errors.semester}</span>}
              </div>
            </div>
          </section>

          <hr className="divider" />

          {/* Contact Information */}
          <section className="form-section">
            <h2 className="section-title">Contact Information</h2>
            <div className="form-group full-width">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3" placeholder="123 Main St, Apt 4B" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="New York" />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="NY" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="form-actions">
            <button onClick={() =>{
             navigate('/students');

            }}
            type="button" className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Student</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddStudent;
