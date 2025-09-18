import React, { useState, useEffect } from "react";
import Header from "./Header";
import "../styles/Profile.css";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState("user"); // Default to user
  const [userData, setUserData] = useState({
    fullName: "Mike Technician",
    bio: "Professional electrician with over 8 years of experience in residential and commercial electrical work. Specialized in smart home installations and energy-efficient solutions.",
    email: "support@skillworkers.com",
    phone: "+91 8852888444",
    location: "Anantapur , India",
    experience: "8+ Years",
    certification: "Licensed Electrician",
    hourlyRate: "45",
    availability: "Available",
    skills: ["Biblical Wiring", "Great Installation", "Smart Home Setup", "Troubleshooting", "Energy Efficiency"]
  });

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    // Load user data from localStorage if available
    const storedUserData = localStorage.getItem("userProfileData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    // Check user role - in a real app, this would come from authentication
    // For demo purposes, we'll check localStorage or use a default
    const role = localStorage.getItem("userRole") || "user";
    setUserRole(role);
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSave = () => {
    localStorage.setItem("userProfileData", JSON.stringify(userData));
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== "") {
      setUserData({
        ...userData,
        skills: [...userData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = [...userData.skills];
    updatedSkills.splice(index, 1);
    setUserData({
      ...userData,
      skills: updatedSkills
    });
  };

  const isTechnician = userRole === "technician";

  return (
    <div className="profile-container">
      <Header />
      
      {/* Success Notification */}
      {showSuccess && (
        <div className="success-notification">
          <div className="success-icon">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <span>Profile saved successfully!</span>
        </div>
      )}
      
      <div className="profile-content">
        <div className="profile-header">
          <h1>Profile Management</h1>
          <button className={`edit-profile-btn ${isEditing ? 'save-mode' : ''}`} onClick={isEditing ? handleSave : handleEditToggle}>
            {isEditing ? "Save Profile" : "Edit Profile"}
          </button>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Full Name</h2>
          {isEditing ? (
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleInputChange}
              className="edit-input full-name-input"
            />
          ) : (
            <p className="full-name">{userData.fullName}</p>
          )}
          
          <h3 className="subsection-title">Bio</h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={userData.bio}
              onChange={handleInputChange}
              className="edit-textarea bio-textarea"
            />
          ) : (
            <p className="bio-text">{userData.bio}</p>
          )}
        </div>

        <div className="section-divider"></div>

        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="edit-input email-input"
                />
              ) : (
                <a href={`mailto:${userData.email}`} className="info-value email-link">{userData.email}</a>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Phone</span>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className="edit-input phone-input"
                />
              ) : (
                <span className="info-value">{userData.phone}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Location</span>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={userData.location}
                  onChange={handleInputChange}
                  className="edit-input location-input"
                />
              ) : (
                <span className="info-value">{userData.location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Only show Professional Details for technicians */}
        {isTechnician && (
          <>
            <div className="section-divider"></div>

            <div className="profile-section">
              <h2 className="section-title">Professional Details</h2>
              
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Experience</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="experience"
                      value={userData.experience}
                      onChange={handleInputChange}
                      className="edit-input experience-input"
                    />
                  ) : (
                    <span className="detail-value">{userData.experience}</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Certification</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="certification"
                      value={userData.certification}
                      onChange={handleInputChange}
                      className="edit-input certification-input"
                    />
                  ) : (
                    <span className="detail-value">{userData.certification}</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Hourly Rate</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="hourlyRate"
                      value={userData.hourlyRate}
                      onChange={handleInputChange}
                      className="edit-input rate-input"
                    />
                  ) : (
                    <span className="detail-value">${userData.hourlyRate}/hr</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Availability</span>
                  {isEditing ? (
                    <select
                      name="availability"
                      value={userData.availability}
                      onChange={handleInputChange}
                      className="edit-select availability-select"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Away">Away</option>
                    </select>
                  ) : (
                    <span className={`availability-tag ${userData.availability.toLowerCase()}`}>
                      {userData.availability}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Only show Skills & Specializations for technicians */}
        {isTechnician && (
          <>
            <div className="section-divider"></div>

            <div className="profile-section">
              <h2 className="section-title">Skills & Specializations</h2>
              
              <div className="skills-grid">
                {userData.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    <span className="skill-text">{skill}</span>
                    {isEditing && (
                      <button 
                        className="remove-skill-btn"
                        onClick={() => handleRemoveSkill(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <div className="add-skill-container">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add new skill"
                    className="skill-input"
                  />
                  <button className="add-skill-btn" onClick={handleAddSkill}>
                    Add Skill
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;