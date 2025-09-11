import React from "react";
import Header from "../components/Header"; // your existing header

import "../styles/UserManagement.css";

const UserManagement = () => {
  const users = [
    {
      name: "John Customer",
      email: "john@email.com",
      role: "Customer",
      status: "Active",
      bookings: 5,
      joined: "2024-01-15",
    },
    {
      name: "Alex Technician",
      email: "alex@email.com",
      role: "Technician",
      status: "Active",
      bookings: 23,
      joined: "2024-01-10",
    },
    {
      name: "Sarah Service",
      email: "sarah@email.com",
      role: "Technician",
      status: "Suspended",
      bookings: 18,
      joined: "2024-01-08",
    },
    {
      name: "Mike Customer",
      email: "mike@email.com",
      role: "Customer",
      status: "Active",
      bookings: 2,
      joined: "2024-01-20",
    },
  ];

  return (
    <div className="dashboard">
      <Header />

      {/* Tabs */}
      <div className="tabs">
        <button className="tab active">Users</button>
        <button className="tab">Services</button>
        <button className="tab">Reports</button>
        <button className="tab">Warnings</button>
        <button className="tab">Settings</button>
      </div>

      {/* User Management Section */}
      <div className="user-management">
        <h2>User Management</h2>

        <div className="top-bar">
          <input
            type="text"
            placeholder="Search users..."
            className="search-box"
          />
          <button className="add-user-btn">Add User</button>
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Bookings</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx}>
                <td>
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      user.status === "Active" ? "active" : "suspended"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td>{user.bookings}</td>
                <td>{user.joined}</td>
                <td className="actions">
                  <button className="icon-btn">
                    <i className="eye">👁</i>
                  </button>
                  <button className="icon-btn">
                    {user.status === "Suspended" ? "✔" : "🚫"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
