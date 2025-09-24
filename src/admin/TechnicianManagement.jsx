import React, { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../firebase";
import "../styles/TechnicianManagement.css";

const TechnicianManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddTechnicianPopup, setShowAddTechnicianPopup] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [deactivatingTechnician, setDeactivatingTechnician] = useState(null);
  const [activatingTechnician, setActivatingTechnician] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [newTechnician, setNewTechnician] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    role: "technician",
    status: "Active",
    bio: "",
    availableTimings: "",
    skills: []
  });
  const [servicesData, setServicesData] = useState({});

  useEffect(() => {
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      if (users) {
        let fetchedTechnicians = Object.values(users).filter(user => user.role === "technician");
        
        // --- ADDED SORTING LOGIC ---
        // Sort by createdAt in descending order (most recent first)
        fetchedTechnicians.sort((a, b) => {
          // Assuming createdAt is a sortable string/timestamp, or default to an empty string if null
          const dateA = a.createdAt || "";
          const dateB = b.createdAt || "";
          return dateB.localeCompare(dateA);
        });
        // ---------------------------

        setTechnicians(fetchedTechnicians);
      }
    });

    const servicesRef = ref(database, "services");
    onValue(servicesRef, (snapshot) => {
      setServicesData(snapshot.val() || {});
    });
  }, []);

  // Create a map for easy lookup of service names by their IDs
  const servicesMap = Object.entries(servicesData).reduce((map, [id, service]) => {
    map[id] = service.title;
    return map;
  }, {});
  
  // Create an array of available skills (service names) for the datalist
  const availableSkillNames = Object.values(servicesData).map(s => s.title);

  const filteredTechnicians = technicians.filter(technician => 
    (technician.firstName + ' ' + technician.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    technician.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTechnicianStatus = (technicianId) => {
    const technician = technicians.find(t => t.uid === technicianId);
    if (technician.status === "Active" || technician.isActive) {
      setDeactivatingTechnician(technician);
    } else {
      setActivatingTechnician(technician);
    }
  };

  const confirmDeactivation = () => {
    if (deactivatingTechnician) {
      const userRef = ref(database, `users/${deactivatingTechnician.uid}`);
      update(userRef, { status: "Suspended", isActive: false })
        .then(() => {
          setDeactivatingTechnician(null);
        })
        .catch(error => {
          console.error("Failed to deactivate technician:", error);
        });
    }
  };

  const confirmActivation = () => {
    if (activatingTechnician) {
      const userRef = ref(database, `users/${activatingTechnician.uid}`);
      update(userRef, { status: "Active", isActive: true })
        .then(() => {
          setActivatingTechnician(null);
        })
        .catch(error => {
          console.error("Failed to activate technician:", error);
        });
    }
  };

  const cancelDeactivation = () => {
    setDeactivatingTechnician(null);
  };
  
  const cancelActivation = () => {
    setActivatingTechnician(null);
  };

  const handleAddTechnician = () => {
    // This part requires a separate user creation flow,
    // so we'll just log the data for now.
    console.log("Adding new technician:", newTechnician);
    setShowAddTechnicianPopup(false);
    setNewTechnician({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      country: "India",
      role: "technician",
      status: "Active",
      bio: "",
      availableTimings: "",
      skills: []
    });
  };

  const handleEditTechnician = () => {
    if (editingTechnician) {
      // Map skill names back to their IDs before saving
      const updatedSkills = editingTechnician.skills.map(skillName =>
        Object.keys(servicesData).find(id => servicesData[id].title === skillName) || skillName
      );

      const userRef = ref(database, `users/${editingTechnician.uid}`);
      update(userRef, {
        firstName: editingTechnician.firstName,
        lastName: editingTechnician.lastName,
        email: editingTechnician.email,
        phone: editingTechnician.phone,
        city: editingTechnician.city,
        state: editingTechnician.state,
        country: editingTechnician.country,
        bio: editingTechnician.bio,
        availableTimings: editingTechnician.availableTimings,
        skills: updatedSkills,
      })
      .then(() => {
        setEditingTechnician(null);
      })
      .catch(error => {
        console.error("Failed to edit technician:", error);
      });
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    
    if (isEdit && editingTechnician) {
      setEditingTechnician({
        ...editingTechnician,
        [name]: value
      });
    } else {
      setNewTechnician({
        ...newTechnician,
        [name]: value
      });
    }
  };

  const openEditPopup = (technician) => {
    // Convert skill IDs to names for editing UI
    const technicianSkills = technician.skills?.map(skillId => servicesMap[skillId] || skillId) || [];
    setEditingTechnician({...technician, skills: technicianSkills});
    setNewSkill("");
  };

  const addSkill = (isEdit = false) => {
    if (newSkill.trim() === "") {
      setNewSkill("");
      return;
    }
    
    const skillName = newSkill.trim();
    if (isEdit && editingTechnician) {
      if (!editingTechnician.skills.includes(skillName)) {
        setEditingTechnician({
          ...editingTechnician,
          skills: [...editingTechnician.skills, skillName]
        });
      }
    } else {
      if (!newTechnician.skills.includes(skillName)) {
        setNewTechnician({
          ...newTechnician,
          skills: [...newTechnician.skills, skillName]
        });
      }
    }
    setNewSkill("");
  };

  const removeSkill = (skillToRemove, isEdit = false) => {
    if (isEdit && editingTechnician) {
      setEditingTechnician({
        ...editingTechnician,
        skills: editingTechnician.skills.filter(skill => skill !== skillToRemove)
      });
    } else {
      setNewTechnician({
        ...newTechnician,
        skills: newTechnician.skills.filter(skill => skill !== skillToRemove)
      });
    }
  };

  const handleSkillKeyPress = (e, isEdit = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(isEdit);
    }
  };

  return (
    <div className="technician-management-container">
      <div className="header-section">
        <h2>Technician Management</h2>
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search technicians..."
              className="search-box"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">⌕</span>
          </div>
          <button 
            className="add-technician-btn"
            onClick={() => setShowAddTechnicianPopup(true)}
          >
            Add Technician
          </button>
        </div>
      </div>

      <table className="technician-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Bio</th>
            <th>Status</th>
            <th>Available Timings</th>
            <th>Skills</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTechnicians.map((technician) => {
            const statusString = typeof technician.status === 'boolean'
              ? (technician.status ? 'Active' : 'Suspended')
              : technician.status;

            const badgeClass = statusString 
              ? statusString.toLowerCase() 
              : (technician.isActive ? 'active' : 'suspended');
            
            const displayStatus = statusString || (technician.isActive ? 'Active' : 'Suspended');

            return (
              <tr key={technician.uid}>
                <td>
                  <div className="technician-name">{technician.firstName} {technician.lastName}</div>
                </td>
                <td>
                  <div className="technician-email">{technician.email}</div>
                </td>
                <td>
                  <div className="bio-text">{technician.bio}</div>
                </td>
                <td>
                  <span className={`status-badge ${badgeClass}`}>
                    {displayStatus}
                  </span>
                </td>
                <td>
                  <p className="timings-text">{technician.availableTimings}</p>
                </td>
                <td>
                  <div className="skills-container">
                    {/* Updated to display skill names instead of IDs */}
                    {technician.skills?.map((skillId, index) => (
                      <span key={index} className="skill-badge">{servicesMap[skillId] || skillId}</span>
                    ))}
                  </div>
                </td>
                <td className="actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={technician.status === "Active" || technician.isActive || technician.status === true}
                      onChange={() => toggleTechnicianStatus(technician.uid)}
                    />
                    <span className="slider"></span>
                  </label>
                  <button 
                    className="edit-icon"
                    onClick={() => openEditPopup(technician)}
                    title="Edit Technician"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Deactivation Confirmation Popup */}
      {deactivatingTechnician && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <h3>Confirm Deactivation</h3>
            <p>Are you sure you want to deactivate {deactivatingTechnician.firstName} {deactivatingTechnician.lastName}?</p>
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
      {activatingTechnician && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <h3>Confirm Activation</h3>
            <p>Are you sure you want to activate {activatingTechnician.firstName} {activatingTechnician.lastName}?</p>
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
      
      {/* Add Technician Popup */}
      {showAddTechnicianPopup && (
        <div className="popup-overlay">
          <div className="add-technician-popup">
            <h3>Add New Technician</h3>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="firstName"
                value={newTechnician.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
              />
              <input
                type="text"
                name="lastName"
                value={newTechnician.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={newTechnician.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={newTechnician.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={newTechnician.city}
                onChange={handleInputChange}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>State:</label>
              <input
                type="text"
                name="state"
                value={newTechnician.state}
                onChange={handleInputChange}
                placeholder="Enter state"
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                name="country"
                value={newTechnician.country}
                onChange={handleInputChange}
                placeholder="Enter country"
              />
            </div>
            <div className="form-group">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={newTechnician.bio}
                onChange={handleInputChange}
                placeholder="Enter technician bio"
              />
            </div>
            <div className="form-group">
              <label>Available Timings:</label>
              <input
                type="text"
                name="availableTimings"
                value={newTechnician.availableTimings}
                onChange={handleInputChange}
                placeholder="e.g., 9:00 AM - 6:00 PM (Mon-Sat)"
              />
            </div>
            <div className="form-group">
              <label>Skills:</label>
              <div className="skills-input-container">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => handleSkillKeyPress(e, false)}
                  placeholder="Add a skill"
                  list="service-options"
                />
                {/* Datalist for available service names */}
                <datalist id="service-options">
                  {availableSkillNames.map((skill, index) => (
                    <option key={index} value={skill} />
                  ))}
                </datalist>
                <button 
                  type="button" 
                  className="add-skill-btn"
                  onClick={() => addSkill(false)}
                >
                  Add Skill
                </button>
              </div>
              <div className="skills-list">
                {newTechnician.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    {skill}
                    <span 
                      className="remove-skill"
                      onClick={() => removeSkill(skill, false)}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="popup-buttons">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddTechnicianPopup(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleAddTechnician}
                disabled={!newTechnician.firstName || !newTechnician.email || !newTechnician.phone}
              >
                Add Technician
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Technician Popup */}
      {editingTechnician && (
        <div className="popup-overlay">
          <div className="edit-technician-popup">
            <h3>Edit Technician</h3>
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={editingTechnician.firstName}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter first name"
              />
               <input
                type="text"
                name="lastName"
                value={editingTechnician.lastName}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter last name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editingTechnician.email}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={editingTechnician.phone}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={editingTechnician.city}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>State:</label>
              <input
                type="text"
                name="state"
                value={editingTechnician.state}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter state"
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                name="country"
                value={editingTechnician.country}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter country"
              />
            </div>
            <div className="form-group">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={editingTechnician.bio}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter technician bio"
              />
            </div>
            <div className="form-group">
              <label>Available Timings:</label>
              <input
                type="text"
                name="availableTimings"
                value={editingTechnician.availableTimings}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="e.g., 9:00 AM - 6:00 PM (Mon-Sat)"
              />
            </div>
            <div className="form-group">
              <label>Skills:</label>
              <div className="skills-input-container">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => handleSkillKeyPress(e, true)}
                  placeholder="Add a skill"
                  list="service-options"
                />
                {/* Datalist for available service names */}
                <datalist id="service-options">
                  {availableSkillNames.map((skill, index) => (
                    <option key={index} value={skill} />
                  ))}
                </datalist>
                <button 
                  type="button" 
                  className="add-skill-btn"
                  onClick={() => addSkill(true)}
                >
                  Add Skill
                </button>
              </div>
              <div className="skills-list">
                {editingTechnician.skills?.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    {skill}
                    <span 
                      className="remove-skill"
                      onClick={() => removeSkill(skill, true)}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="popup-buttons">
              <button 
                className="cancel-btn"
                onClick={() => setEditingTechnician(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleEditTechnician}
                disabled={!editingTechnician.firstName || !editingTechnician.email || !editingTechnician.phone}
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

export default TechnicianManagement;