import React, { useState } from "react";
import "./Sidebar.css"; 

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <div className="sidebar-content">
        <a href="#">Dashboard</a>
        <a href="#">Settings</a>
        <a href="#">Profile</a>
        <a href="#">Logout</a>
      </div>
    </div>
  );
}

export default Sidebar;