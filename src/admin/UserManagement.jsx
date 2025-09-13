import React, { useState } from "react";
import "../styles/UserManagement.css";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul.sharma@email.com",
      phone: "+91 9876543210",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      role: "Customer",
      status: "Active",
      joined: "2024-01-15",
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya.patel@email.com",
      phone: "+91 8765432109",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      role: "Technician",
      status: "Active",
      joined: "2024-01-10",
    },
    {
      id: 3,
      name: "Vikram Singh",
      email: "vikram.singh@email.com",
      phone: "+91 7654321098",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      role: "Technician",
      status: "Suspended",
      joined: "2024-01-08",
    },
    {
      id: 4,
      name: "Anjali Mehta",
      email: "anjali.mehta@email.com",
      phone: "+91 6543210987",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      role: "Customer",
      status: "Active",
      joined: "2024-01-20",
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    role: "Customer",
    status: "Active",
    joined: new Date().toISOString().split('T')[0]
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user.status === "Active") {
      setDeactivatingUser(user);
    } else {
      setUsers(users.map(u => 
        u.id === userId ? {...u, status: "Active"} : u
      ));
    }
  };

  const confirmDeactivation = () => {
    if (deactivatingUser) {
      setUsers(users.map(u => 
        u.id === deactivatingUser.id ? {...u, status: "Suspended"} : u
      ));
      setDeactivatingUser(null);
    }
  };

  const cancelDeactivation = () => {
    setDeactivatingUser(null);
  };

  const handleAddUser = () => {
    const newUserWithId = {
      ...newUser,
      id: Math.max(...users.map(u => u.id), 0) + 1
    };
    setUsers([...users, newUserWithId]);
    setShowAddUserPopup(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      country: "India",
      role: "Customer",
      status: "Active",
      joined: new Date().toISOString().split('T')[0]
    });
  };

  const handleEditUser = () => {
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id ? editingUser : u
      ));
      setEditingUser(null);
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    
    if (isEdit && editingUser) {
      setEditingUser({
        ...editingUser,
        [name]: value
      });
    } else {
      setNewUser({
        ...newUser,
        [name]: value
      });
    }
  };

  const openEditPopup = (user) => {
    setEditingUser({...user});
  };

  return (
    <div className="user-management-container">
      <div className="header-section">
        <h2>User Management</h2>
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              className="search-box"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">⌕</span>
          </div>
          <button 
            className="add-user-btn"
            onClick={() => setShowAddUserPopup(true)}
          >
            Add User
          </button>
        </div>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <p>{user.phone} • {user.city}, {user.state}</p>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge ${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`status-badge ${user.status.toLowerCase()}`}>
                  {user.status}
                </span>
              </td>
              <td>{user.joined}</td>
              <td className="actions">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={user.status === "Active"}
                    onChange={() => toggleUserStatus(user.id)}
                  />
                  <span className="slider"></span>
                </label>
                <button 
                  className="edit-icon"
                  onClick={() => openEditPopup(user)}
                  title="Edit User"
                >
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Deactivation Confirmation Popup */}
      {deactivatingUser && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <h3>Confirm Deactivation</h3>
            <p>Are you sure you want to deactivate {deactivatingUser.name}?</p>
            <div className="popup-buttons">
              <button className="cancel-btn" onClick={cancelDeactivation}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmDeactivation}>
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Popup */}
      {showAddUserPopup && (
        <div className="popup-overlay">
          <div className="add-user-popup">
            <h3>Add New User</h3>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={newUser.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={newUser.city}
                onChange={handleInputChange}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>State:</label>
              <input
                type="text"
                name="state"
                value={newUser.state}
                onChange={handleInputChange}
                placeholder="Enter state"
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                name="country"
                value={newUser.country}
                onChange={handleInputChange}
                placeholder="Enter country"
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
              >
                <option value="Customer">Customer</option>
                <option value="Technician">Technician</option>
              </select>
            </div>
            <div className="popup-buttons">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddUserPopup(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || !newUser.phone}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Popup */}
      {editingUser && (
        <div className="popup-overlay">
          <div className="edit-user-popup">
            <h3>Edit User</h3>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                value={editingUser.name}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editingUser.email}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={editingUser.phone}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={editingUser.city}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>State:</label>
              <input
                type="text"
                name="state"
                value={editingUser.state}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter state"
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                name="country"
                value={editingUser.country}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter country"
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                name="role"
                value={editingUser.role}
                onChange={(e) => handleInputChange(e, true)}
              >
                <option value="Customer">Customer</option>
                <option value="Technician">Technician</option>
              </select>
            </div>
            <div className="popup-buttons">
              <button 
                className="cancel-btn"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleEditUser}
                disabled={!editingUser.name || !editingUser.email || !editingUser.phone}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;