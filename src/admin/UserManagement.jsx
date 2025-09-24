import React, { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../firebase";
import "../styles/UserManagement.css";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [activatingUser, setActivatingUser] = useState(null);
  const [users, setUsers] = useState([]);
  
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    role: "user",
    status: "Active",
    joined: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      if (users) {
        let fetchedUsers = Object.values(users).filter(user => user.role === "user");
        
        // --- ADDED SORTING LOGIC ---
        // Sort by createdAt in descending order (most recent first)
        fetchedUsers.sort((a, b) => {
          // Assuming createdAt is a sortable string/timestamp, or default to an empty string if null
          const dateA = a.createdAt || "";
          const dateB = b.createdAt || "";
          return dateB.localeCompare(dateA);
        });
        // ---------------------------

        setUsers(fetchedUsers);
      }
    });
  }, []);

  const filteredUsers = users.filter(user => 
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = (userId) => {
    const user = users.find(u => u.uid === userId);
    if (user.status === "Active" || user.status) {
      setDeactivatingUser(user);
    } else {
      setActivatingUser(user);
    }
  };

  const confirmDeactivation = () => {
    if (deactivatingUser) {
      const userRef = ref(database, `users/${deactivatingUser.uid}`);
      update(userRef, { status: "Suspended" })
        .then(() => {
          setDeactivatingUser(null);
        })
        .catch(error => {
          console.error("Failed to deactivate user:", error);
        });
    }
  };

  const confirmActivation = () => {
    if (activatingUser) {
      const userRef = ref(database, `users/${activatingUser.uid}`);
      update(userRef, { status: "Active" })
        .then(() => {
          setActivatingUser(null);
        })
        .catch(error => {
          console.error("Failed to activate user:", error);
        });
    }
  };

  const cancelDeactivation = () => {
    setDeactivatingUser(null);
  };

  const cancelActivation = () => {
    setActivatingUser(null);
  };

  const handleAddUser = () => {
    // This part requires a separate user creation flow
    console.log("Adding new user:", newUser);
    setShowAddUserPopup(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      country: "India",
      role: "user",
      status: "Active",
      joined: new Date().toISOString().slice(0, 10),
    });
  };

  const handleEditUser = () => {
    if (editingUser) {
      const userRef = ref(database, `users/${editingUser.uid}`);
      update(userRef, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        phone: editingUser.phone,
        city: editingUser.city,
        state: editingUser.state,
        country: editingUser.country,
      })
      .then(() => {
        setEditingUser(null);
      })
      .catch(error => {
        console.error("Failed to edit user:", error);
      });
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
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.uid}>
              <td>
                <div className="user-name">{user.firstName} {user.lastName}</div>
              </td>
              <td>
                <div className="user-email">{user.email}</div>
              </td>
              <td>
                <div className="user-phone">{user.phone}</div>
              </td>
              <td>
                <div className="user-location">{user.city}, {user.state}</div>
              </td>
              <td>
                <span className={`role-badge ${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </td>
              <td>
                {/* Corrected code for handling user status */}
                <span className={`status-badge ${user.status === true || user.status === false ? (user.status ? 'active' : 'suspended') : user.status?.toLowerCase() || 'suspended'}`}>
                  {user.status === true || user.status === false ? (user.status ? 'Active' : 'Suspended') : user.status || 'Suspended'}
                </span>
              </td>
              <td>
                <div className="user-joined">{user.createdAt?.slice(0, 10) || 'N/A'}</div>
              </td>
              <td className="actions">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={user.status === "Active" || user.status === true}
                    onChange={() => toggleUserStatus(user.uid)}
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
            <p>Are you sure you want to deactivate {deactivatingUser.firstName} {deactivatingUser.lastName}?</p>
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

      {/* Activation Confirmation Popup */}
      {activatingUser && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <h3>Confirm Activation</h3>
            <p>Are you sure you want to activate {activatingUser.firstName} {activatingUser.lastName}?</p>
            <div className="popup-buttons">
              <button className="cancel-btn" onClick={cancelActivation}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmActivation}>
                Yes, Activate
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
                <option value="user">User</option>
                <option value="technician">Technician</option>
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
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={editingUser.firstName}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
               <input
                type="text"
                name="lastName"
                value={editingUser.lastName}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter last name"
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
                <option value="user">User</option>
                <option value="technician">Technician</option>
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
                disabled={!editingUser.firstName || !editingUser.email || !editingUser.phone}
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