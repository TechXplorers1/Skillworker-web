import React, { useState } from "react";
import Header from "../components/Header";
import UserManagement from "./UserManagement";
import TechnicianManagement from "./TechnicianManagement";
import BookingManagement from "./BookingManagement";
import ServiceManagement from "./ServiceManagement";
import Settings from "./Settings";

import { FaUsers, FaTools, FaCalendarCheck, FaConciergeBell } from "react-icons/fa";
import { MdSettings, MdAnalytics, MdNotifications, MdSupport } from "react-icons/md";

import "../styles/Dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Users");

  const renderContent = () => {
    switch (activeTab) {
      case "Users":
        return <UserManagement />;
      case "Technicians":
        return <TechnicianManagement />;
      case "Bookings":
        return <BookingManagement />;
      case "Services":
        return <ServiceManagement />;
      case "Settings":
        return <Settings />;
      default:
        return <div className="placeholder">Content coming soon...</div>;
    }
  };

  const tabs = [
    { id: "Users", icon: <FaUsers /> },
    { id: "Technicians", icon: <FaTools /> },
    { id: "Bookings", icon: <FaCalendarCheck /> },
    { id: "Services", icon: <FaConciergeBell /> },
    { id: "Settings", icon: <MdSettings /> },
  ];

  return (
    <div className="dashboard-container">
      <Header />

      <div className="glass-radio-group">
        {tabs.map((tab) => (
          <React.Fragment key={tab.id}>
            <input
              type="radio"
              name="dashboard-tabs"
              id={`tab-${tab.id}`}
              checked={activeTab === tab.id}
              onChange={() => setActiveTab(tab.id)}
            />
            <label htmlFor={`tab-${tab.id}`}>
              {tab.icon}
              {tab.id}
            </label>
          </React.Fragment>
        ))}
        <div className="glass-glider" />
      </div>

      <div className="content">{renderContent()}</div>
    </div>
  );
};

export default Dashboard;