import React, { useState } from "react";
import Header from "../components/Header";
import UserManagement from "./UserManagement";
// import Reports from "./Reports"; // you’ll add other screens the same way

import "./Dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Users");

  const renderContent = () => {
    switch (activeTab) {
      case "Users":
        return <UserManagement />;
      // case "Reports":
      //   return <Reports />;
      default:
        return <div className="placeholder">Content coming soon...</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Header />

      {/* Tabs/Filters */}
      <div className="tabs">
        {["Users", "Services", "Reports", "Warnings", "Settings"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="content">{renderContent()}</div>
    </div>
  );
};

export default Dashboard;
