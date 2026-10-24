import React from "react";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  // Get current user name from localStorage or fallback
  const savedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const username = savedUser.name || "Sanjana";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-right">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        <button className="icon-btn" title="Notifications">
          <Bell size={20} />
        </button>

        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <span className="username">{username}</span>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout} 
          className="icon-btn logout-btn" 
          title="Log Out"
          style={{ color: "#ef4444", marginLeft: "8px", cursor: "pointer" }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}