import React, { useState, useEffect } from "react";
import { ref, onValue, update, push } from "firebase/database";
import { database } from "../firebase";
import "../styles/UserManagement.css";

// Note: For actual user creation (including password reset email), you would
// need to use Firebase Authentication functions (e.g., createUserWithEmailAndPassword)
// AND potentially a Cloud Function/Admin SDK on the backend to send the password
// reset link, as direct `sendPasswordResetEmail` requires the user to exist in Auth.

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [activatingUser, setActivatingUser] = useState(null);
  const [users, setUsers] = useState([]);
  
  const [newUser, setNewUser] = useState({
    firstName: "", 
    lastName: "",  
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    role: "user",
    status: "Active",
    // Use a proper timestamp for sorting and display
    createdAt: new Date().toISOString(), 
  });

  useEffect(() => {
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const fetchedUsers = Object.keys(usersData).map(uid => ({
          ...usersData[uid],
          uid: uid // Use the actual Firebase key as UID
        }));
        
        // Filter out technicians - only show users and admins
        const nonTechnicianUsers = fetchedUsers.filter(user => 
          user.role !== "technician"
        );
        
        // Sort by createdAt in descending order (most recent first)
        nonTechnicianUsers.sort((a, b) => {
          const dateA = a.createdAt || "";
          const dateB = b.createdAt || "";
          // localeCompare is safe for ISO strings
          return dateB.localeCompare(dateA); 
        });

        setUsers(nonTechnicianUsers);
      } else {
        setUsers([]);
      }
    });
  }, []);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusString = (status) => {
    if (status === true || status === "Active") return "Active";
    if (status === false || status === "Suspended") return "Suspended";
    return "Suspended"; // Default to suspended if status is unknown/null
  };

  const toggleUserStatus = (userId) => {
    const user = users.find(u => u.uid === userId);
    if (!user) return;

    const currentStatus = getStatusString(user.status);

    if (currentStatus === "Active") {
      setDeactivatingUser(user);
      setActivatingUser(null);
    } else {
      setActivatingUser(user);
      setDeactivatingUser(null);
    }
  };

  const confirmDeactivation = () => {
    if (deactivatingUser) {
      const userRef = ref(database, `users/${deactivatingUser.uid}`);
      // Using "Suspended" string as per existing logic
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
      // Using "Active" string as per existing logic
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
    if (!newUser.firstName || !newUser.email || !newUser.phone) {
      alert("First Name, Email, and Phone are required.");
      return;
    }

    const userRef = ref(database, "users");
    const newUserData = {
      ...newUser,
      createdAt: new Date().toISOString(),
    };

    // NOTE: This will create a record, but the user won't exist in Firebase AUTH 
    // and won't be able to log in until you implement the Auth step.
    push(userRef, newUserData)
      .then((snap) => {
        // Update the new object with the key it was saved under
        update(snap, { uid: snap.key }); 
        console.log("Successfully added new user entry to DB (Auth needed for login/email).");
        setShowAddUserPopup(false);
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          city: "",
          state: "",
          country: "India",
          role: "user",
          status: "Active",
          createdAt: new Date().toISOString(),
        });
      })
      .catch(error => {
        console.error("Failed to add new user to database:", error);
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
        role: editingUser.role, // Added role update
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
  
  // Helper to format date string
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return isoString.slice(0, 10);
    } catch (e) {
      return 'N/A';
    }
  };


  return (
    <div className="user-management-container">
      <div className="header-section">
        <h2>User Management</h2>
        <div className="controls">
          <div className="search-container">
            <span className="search-icon">⌕</span> 
            <input
              type="text"
              placeholder="Search users..."
              className="search-box"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="add-user-btn"
            onClick={() => setShowAddUserPopup(true)}
          >
            Add User
          </button>
        </div>
      </div>

      <div className="table-container"> {/* Added table-container div */}
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
            {filteredUsers.map((user) => {
              const statusString = getStatusString(user.status);
              return (
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
                  <span className={`role-badge ${user.role?.toLowerCase() || 'user'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${statusString.toLowerCase()}`}>
                    {statusString}
                  </span>
                </td>
                <td>
                  <div className="user-joined">{formatDate(user.createdAt)}</div>
                </td>
                <td className="actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={statusString === "Active"}
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
            );
          })}
          </tbody>
        </table>
      </div>

      {/* Deactivation Confirmation Popup */}
      {deactivatingUser && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <h3>Confirm Deactivation</h3>
            <p>Are you sure you want to **deactivate** {deactivatingUser.firstName} {deactivatingUser.lastName}?</p>
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
            <p>Are you sure you want to **activate** {activatingUser.firstName} {activatingUser.lastName}?</p>
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
            <button className="close-btn" onClick={() => setShowAddUserPopup(false)}>&times;</button>
            <h3>Add New User</h3>
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={newUser.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={newUser.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
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
                <option value="admin">Admin</option> 
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
                disabled={!newUser.firstName || !newUser.email || !newUser.phone}
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
            <button className="close-btn" onClick={() => setEditingUser(null)}>&times;</button>
            <h3>Edit User</h3>
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={editingUser.firstName || ''}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
               <input
                type="text"
                name="lastName"
                value={editingUser.lastName || ''}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter last name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editingUser.email || ''}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={editingUser.phone || ''}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={editingUser.city || ''}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>State:</label>
              <input
                type="text"
                name="state"
                value={editingUser.state || ''}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter state"
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                name="country"
                value={editingUser.country || ''}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter country"
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                name="role"
                value={editingUser.role || 'user'}
                onChange={(e) => handleInputChange(e, true)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option> 
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