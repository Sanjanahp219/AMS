import React, { useState, useEffect } from "react";
import { departments } from "../data/deparments.js"
import { Link } from "react-router-dom";
import "./Departments.css"
import {Delete , Edit , X} from "lucide-react"

export default function Departments() {
    const [deparment, setdeparment] = useState({
        departmentid: "",
        departmentname: "",
        students: "",
    })
    const [showForm, setShowForm] = useState(false);
    
    const [departmentList, setDepartmentList] = useState(() =>{
        const savedData = localStorage.getItem("savedDeparments");
        return savedData ? JSON.parse(savedData) : departments;

    });

    useEffect(() =>{
        localStorage.setItem("savedDeparments", JSON.stringify(departmentList));

    }, [departmentList])

    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        
        if (!deparment.departmentid || !deparment.departmentname || !deparment.students) {
            alert("Please fill out all fields!");
            return;
        }

        if(isEditing){
            setDepartmentList(departmentList.map(dept => 
            dept.departmentid === deparment.departmentid ? deparment : dept
            ));
            setIsEditing(false);
        }else{
            const isDuplicate = departmentList.some(dept => dept.departmentid === deparment.departmentid);
            if (isDuplicate) {
                alert("This Department ID already exists! Please use a unique ID.");
                return;
            }
            setDepartmentList([...departmentList, deparment]);
        }

        setShowForm(false);
        setdeparment({
        departmentid: "",
        departmentname: "",
        students: "",
    });
    }
    const handleDelete=(id) => {
       setDepartmentList(departmentList.filter( dep => dep.departmentid !== id));
    }
    const handleEdit = (dep) =>{
        setdeparment(dep);
        setIsEditing(true);
        setShowForm(true);
    }
    return(
       <div className="dtable">

        {showForm && (
            <div className="department-form-container">
                <form className="department-form" style={{ position: "relative" }}>
                    <button 
                        type="button" 
                        onClick={() => {
                            setShowForm(false);
                            setdeparment({ departmentid: "", departmentname: "", students: "" });
                            setIsEditing(false);
                        }}
                        style={{ position: "absolute", top: "20px", right: "20px", background: "#f16363de", border: "none", cursor: "pointer" }}
                    >
                        <X size={24} />
                    </button>
                    <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "22px", textAlign: "center" }}>
                        {isEditing ? "Edit Department" : "Add New Department"}
                    </h2>
                    <div className="form-group">
                        <label>Department ID</label>
                        <input type="text" placeholder="001" value={deparment.departmentid} onChange={(e) => setdeparment({...deparment, departmentid: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Department Name</label>
                        <input type="text" placeholder="Computer Science" value={deparment.departmentname} onChange={(e) => setdeparment({...deparment, departmentname: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Students Count</label>
                        <input type="number" placeholder="0" value={deparment.students} onChange={(e) => setdeparment({...deparment, students: e.target.value})} />
                    </div>
                    <button type="submit" className="submit-btn" onClick={handleSubmit}>Save Department</button>
                </form>
            </div>
        )}
        
        <div className="deparment-main">
            <div className="deparment-main-content">
              <h1>Departments</h1>
              <p>Add new Deparment Below</p>
            </div>
            <div className="department-right">
              <button className="add-button" onClick={() => {
                    setdeparment({ departmentid: "", departmentname: "", students: "" });
                    setIsEditing(false);
                    setShowForm(true);
                    }}>
                   Add Department
              </button>
            </div>
            
        </div>
        <table>
            <tr>
                <th>Department ID</th>
                <th>Department Name</th>
                <th>Students</th>
                <th >Edit</th>
                <th>Delete</th>
            </tr>
            {departmentList.map((deparment) => (
                <tr key={deparment.departmentid}>
                    <td>{deparment.departmentid}</td>
                    <td >{deparment.departmentname}</td>
                    <td>{deparment.students}</td>
                    <td className="edit"><button onClick={() => handleEdit(deparment)}><Edit size={15}/></button></td>
                     <td className="delete"><button onClick={() => handleDelete(deparment.departmentid)}><Delete size={15}/></button></td>
                </tr>
            )
            )}
            <tr >
                <td></td>
                <td></td>
                <td></td>

            </tr>

        </table>

       </div>
    )
  

}