import React, { useState, useEffect } from "react";
import Header from "./Header";
import { ref, get, update } from "firebase/database";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Profile.css";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userRef = ref(database, 'users/' + uid);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        // Set default structure if user doesn't exist in database
        setUserData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          city: "",
          state: "",
          pincode: "",
          country: "",
          dob: "",
          gender: "",
          bio: "",
          profileImage: "assets/profile_pic.jpg",
          status: true,
          role: "user",
          // Technician specific fields
          availableTimings: "",
          skills: [],
          certification: "",
          experience: "",
          hourlyRate: "",
          availability: "Available"
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        await update(userRef, userData);
        setShowSuccess(true);
        setIsEditing(false);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== "") {
      setUserData({
        ...userData,
        skills: [...(userData.skills || []), newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = [...(userData.skills || [])];
    updatedSkills.splice(index, 1);
    setUserData({
      ...userData,
      skills: updatedSkills
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Header />
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <Header />
        <div className="error-message">User not found</div>
      </div>
    );
  }

  const isTechnician = userData.role === "technician";

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

        {/* Profile Image Section */}
        <div className="profile-section">
          <h2 className="section-title">Profile Photo</h2>
          <div className="profile-image-container">
            <img 
              src={userData.profileImage || "assets/profile_pic.jpg"} 
              alt="Profile" 
              className="profile-image"
            />
            {isEditing && (
              <button className="change-photo-btn">
                Change Photo
              </button>
            )}
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Basic Information */}
        <div className="profile-section">
          <h2 className="section-title">Basic Information</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">First Name</span>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.firstName || "Not set"}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Last Name</span>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.lastName || "Not set"}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Email</span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={userData.email || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <a href={`mailto:${userData.email}`} className="info-value email-link">{userData.email || "Not set"}</a>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Phone</span>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.phone || "Not set"}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={userData.dob || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.dob || "Not set"}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Gender</span>
              {isEditing ? (
                <select
                  name="gender"
                  value={userData.gender || ""}
                  onChange={handleInputChange}
                  className="edit-select"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span className="info-value">{userData.gender || "Not set"}</span>
              )}
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Address Information */}
        <div className="profile-section">
          <h2 className="section-title">Address Information</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">City</span>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={userData.city || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.city || "Not set"}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">State</span>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={userData.state || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.state || "Not set"}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Pincode</span>
              {isEditing ? (
                <input
                  type="text"
                  name="pincode"
                  value={userData.pincode || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.pincode || "Not set"}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Country</span>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={userData.country || ""}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.country || "Not set"}</span>
              )}
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Bio Section */}
        <div className="profile-section">
          <h2 className="section-title">Bio</h2>
          {isEditing ? (
            <textarea
              name="bio"
              value={userData.bio || ""}
              onChange={handleInputChange}
              className="edit-textarea bio-textarea"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="bio-text">{userData.bio || "No bio provided"}</p>
          )}
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
                      value={userData.experience || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="e.g., 5+ years"
                    />
                  ) : (
                    <span className="detail-value">{userData.experience || "Not specified"}</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Certification</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="certification"
                      value={userData.certification || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="e.g., Licensed Electrician"
                    />
                  ) : (
                    <span className="detail-value">{userData.certification || "Not specified"}</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Hourly Rate</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="hourlyRate"
                      value={userData.hourlyRate || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="e.g., 45"
                    />
                  ) : (
                    <span className="detail-value">${userData.hourlyRate || "0"}/hr</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Available Timings</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="availableTimings"
                      value={userData.availableTimings || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="e.g., 9 AM - 6 PM"
                    />
                  ) : (
                    <span className="detail-value">{userData.availableTimings || "Not specified"}</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Availability</span>
                  {isEditing ? (
                    <select
                      name="availability"
                      value={userData.availability || "Available"}
                      onChange={handleInputChange}
                      className="edit-select"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Away">Away</option>
                    </select>
                  ) : (
                    <span className={`availability-tag ${(userData.availability || "").toLowerCase()}`}>
                      {userData.availability || "Available"}
                    </span>
                  )}
                </div>

                <div className="detail-item">
                  <span className="detail-label">NIN</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nin"
                      value={userData.nin || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="National Identification Number"
                    />
                  ) : (
                    <span className="detail-value">{userData.nin || "Not provided"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="section-divider"></div>

            <div className="profile-section">
              <h2 className="section-title">Skills & Specializations</h2>
              
              <div className="skills-grid">
                {(userData.skills || []).map((skill, index) => (
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