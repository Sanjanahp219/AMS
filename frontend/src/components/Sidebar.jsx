import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const location = useLocation();

  const savedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userName = savedUser.name || "Administrator";
  const userRole = savedUser.role || "Admin";
  const initial = userName.charAt(0).toUpperCase() || "A";

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <aside className={`sidebar ${!isSidebarOpen ? "collapsed" : ""}`}>
      {/* Header / Logo */}
      <div className="sidebar-header">
        <div className="logo-icon-container">
          <GraduationCap size={22} />
        </div>
        <div className="logo-text">
          <h2>AMS</h2>
          <span>AMS MANAGEMENT</span>
        </div>
        <button
          className="menu"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-scrollable">
        {/* MAIN Section */}
        <div className="sidebar-section">
          <h3 className="section-title">MAIN</h3>
          <nav className="sidebar-nav">
            <Link
              to="/dashboard"
              className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            {/* Students Dropdown */}
            <div className="nav-group">
              <button
                className={`nav-item ${
                  location.pathname.includes("student") ? "active" : ""
                }`}
                onClick={() => setIsStudentsOpen(!isStudentsOpen)}
              >
                <Users size={18} />
                <span>Students</span>
                {isStudentsOpen ? (
                  <ChevronDown size={16} className="chevron" />
                ) : (
                  <ChevronRight size={16} className="chevron" />
                )}
              </button>

              {isStudentsOpen && (
                <div className="sub-menu">
                  <Link
                    to="/students"
                    className={`sub-item ${isActive("/students") ? "active" : ""}`}
                  >
                    All Students
                  </Link>
                  <Link
                    to="/add-student"
                    className={`sub-item ${isActive("/add-student") ? "active" : ""}`}
                  >
                    Register Student
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* ACADEMICS Section */}
        <div className="sidebar-section">
          <h3 className="section-title">ACADEMICS</h3>
          <nav className="sidebar-nav">
            <Link
              to="/courses"
              className={`nav-item ${isActive("/courses") ? "active" : ""}`}
            >
              <BookOpen size={18} />
              <span>Courses</span>
            </Link>
            <Link
              to="/batches"
              className={`nav-item ${isActive("/batches") ? "active" : ""}`}
            >
              <Calendar size={18} />
              <span>Batches</span>
            </Link>
          </nav>
        </div>

        {/* ENROLLMENTS & FEES */}
        <div className="sidebar-section">
          <h3 className="section-title">ENROLLMENT & FEES</h3>
          <nav className="sidebar-nav">
            <Link
              to="/enrollments"
              className={`nav-item ${isActive("/enrollments") ? "active" : ""}`}
            >
              <ClipboardList size={18} />
              <span>Enrollments</span>
            </Link>
            <Link
              to="/payments"
              className={`nav-item ${isActive("/payments") ? "active" : ""}`}
            >
              <CreditCard size={18} />
              <span>Payments & Fees</span>
            </Link>
          </nav>
        </div>

        {/* MANAGEMENT & REPORTS */}
        <div className="sidebar-section">
          <h3 className="section-title">MANAGEMENT</h3>
          <nav className="sidebar-nav">
            <Link
              to="/reports"
              className={`nav-item ${isActive("/reports") ? "active" : ""}`}
            >
              <FileText size={18} />
              <span>Reports</span>
            </Link>

            {/* Admin only: Staff Accounts */}
            {userRole === "Admin" && (
              <Link
                to="/staff"
                className={`nav-item ${isActive("/staff") ? "active" : ""}`}
              >
                <ShieldCheck size={18} />
                <span>Staff Management</span>
              </Link>
            )}

            <Link
              to="/settings"
              className={`nav-item ${isActive("/settings") ? "active" : ""}`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initial}</div>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="more-btn"
          title="Sign Out"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#f87171" }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
