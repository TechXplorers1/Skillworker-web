import React, { useState } from "react";
import "../styles/TechnicianManagement.css";

const TechnicianManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddTechnicianPopup, setShowAddTechnicianPopup] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [deactivatingTechnician, setDeactivatingTechnician] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  
  const [technicians, setTechnicians] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      phone: "+91 9876543210",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      role: "Technician",
      status: "Active",
      bio: "Experienced AC repair technician with 8 years of expertise in servicing all major brands. Specialized in troubleshooting complex electrical issues and providing efficient cooling solutions.",
      timings: "9:00 AM - 6:00 PM (Mon-Sat)",
      skills: ["AC Repair", "AC Installation", "AC Maintenance", "Gas Charging"]
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 8765432109",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      role: "Technician",
      status: "Active",
      bio: "Skilled refrigerator technician with extensive knowledge of modern refrigeration systems. Committed to providing prompt and reliable service with attention to detail.",
      timings: "10:00 AM - 7:00 PM (Tue-Sun)",
      skills: ["Refrigerator Repair", "Freezer Service", "Cooling System Maintenance"]
    },
    {
      id: 3,
      name: "Vikram Singh",
      email: "vikram.singh@email.com",
      phone: "+91 7654321098",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      role: "Technician",
      status: "Suspended",
      bio: "Expert washing machine technician with 6 years of hands-on experience. Specializes in repairing front-load and top-load machines of all major brands.",
      timings: "8:00 AM - 5:00 PM (Mon-Fri)",
      skills: ["Washing Machine Repair", "Dryer Service", "Water Pump Replacement"]
    },
    {
      id: 4,
      name: "Anjali Patel",
      email: "anjali.patel@email.com",
      phone: "+91 6543210987",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      role: "Technician",
      status: "Active",
      bio: "Versatile home appliance technician with expertise in multiple domains. Known for efficient problem-solving and customer-friendly approach to appliance repairs.",
      timings: "9:30 AM - 6:30 PM (Mon-Sat)",
      skills: ["Microwave Repair", "Oven Service", "Mixer Grinder Repair", "Small Appliance Fixing"]
    }
  ]);

  const [newTechnician, setNewTechnician] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    role: "Technician",
    status: "Active",
    bio: "",
    timings: "9:00 AM - 6:00 PM",
    skills: []
  });

  const filteredTechnicians = technicians.filter(technician => 
    technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    technician.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTechnicianStatus = (technicianId) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (technician.status === "Active") {
      setDeactivatingTechnician(technician);
    } else {
      setTechnicians(technicians.map(t => 
        t.id === technicianId ? {...t, status: "Active"} : t
      ));
    }
  };

  const confirmDeactivation = () => {
    if (deactivatingTechnician) {
      setTechnicians(technicians.map(t => 
        t.id === deactivatingTechnician.id ? {...t, status: "Suspended"} : t
      ));
      setDeactivatingTechnician(null);
    }
  };

  const cancelDeactivation = () => {
    setDeactivatingTechnician(null);
  };

  const handleAddTechnician = () => {
    const newTechnicianWithId = {
      ...newTechnician,
      id: Math.max(...technicians.map(t => t.id), 0) + 1
    };
    setTechnicians([...technicians, newTechnicianWithId]);
    setShowAddTechnicianPopup(false);
    setNewTechnician({
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      country: "India",
      role: "Technician",
      status: "Active",
      bio: "",
      timings: "9:00 AM - 6:00 PM",
      skills: []
    });
  };

  const handleEditTechnician = () => {
    if (editingTechnician) {
      setTechnicians(technicians.map(t => 
        t.id === editingTechnician.id ? editingTechnician : t
      ));
      setEditingTechnician(null);
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
    setEditingTechnician({...technician});
    setNewSkill("");
  };

  const addSkill = (isEdit = false) => {
    if (newSkill.trim() === "") return;
    
    if (isEdit && editingTechnician) {
      setEditingTechnician({
        ...editingTechnician,
        skills: [...editingTechnician.skills, newSkill.trim()]
      });
    } else {
      setNewTechnician({
        ...newTechnician,
        skills: [...newTechnician.skills, newSkill.trim()]
      });
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
          {filteredTechnicians.map((technician) => (
            <tr key={technician.id}>
               <td>
                <div className="technician-name">{technician.name}</div>
              </td>
              <td>
                <div className="technician-email">{technician.email}</div>
              </td>
              <td>
                <div className="bio-text">{technician.bio}</div>
              </td>
              <td>
                <span className={`status-badge ${technician.status.toLowerCase()}`}>
                  {technician.status}
                </span>
              </td>
              <td>
                <p className="timings-text">{technician.timings}</p>
              </td>
              <td>
                <div className="skills-container">
                  {technician.skills.map((skill, index) => (
                    <span key={index} className="skill-badge">{skill}</span>
                  ))}
                </div>
              </td>
              <td className="actions">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={technician.status === "Active"}
                    onChange={() => toggleTechnicianStatus(technician.id)}
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
          ))}
        </tbody>
      </table>

      {/* Deactivation Confirmation Popup */}
      {deactivatingTechnician && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <h3>Confirm Deactivation</h3>
            <p>Are you sure you want to deactivate {deactivatingTechnician.name}?</p>
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

      {/* Add Technician Popup */}
      {showAddTechnicianPopup && (
        <div className="popup-overlay">
          <div className="add-technician-popup">
            <h3>Add New Technician</h3>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                value={newTechnician.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
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
                name="timings"
                value={newTechnician.timings}
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
                />
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
                disabled={!newTechnician.name || !newTechnician.email || !newTechnician.phone}
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
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                value={editingTechnician.name}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter full name"
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
                name="timings"
                value={editingTechnician.timings}
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
                />
                <button 
                  type="button" 
                  className="add-skill-btn"
                  onClick={() => addSkill(true)}
                >
                  Add Skill
                </button>
              </div>
              <div className="skills-list">
                {editingTechnician.skills.map((skill, index) => (
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
                disabled={!editingTechnician.name || !editingTechnician.email || !editingTechnician.phone}
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