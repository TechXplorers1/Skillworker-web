import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ref, get, update, onValue } from "firebase/database";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Profile.css";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user.uid);
        await fetchAllServices();
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
        const data = snapshot.val();
        if (!data.skills || !Array.isArray(data.skills)) {
          data.skills = [];
        }
        setUserData(data);
      } else {
        setUserData({
          firstName: "", lastName: "", email: "", phone: "", city: "",
          state: "", zipCode: "", dob: "", gender: "", bio: "",
          role: "user", availableTimings: "", skills: [], experience: ""
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllServices = async () => {
    const servicesRef = ref(database, 'services');
    onValue(servicesRef, (snapshot) => {
      const servicesData = snapshot.val();
      if (servicesData) {
        const servicesList = Object.entries(servicesData).map(([id, data]) => ({
          id,
          title: data.title,
        }));
        setAllServices(servicesList);
      }
    });
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
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

  const handleSkillChange = (serviceId, isChecked) => {
    const currentSkills = userData.skills || [];
    let updatedSkills;
    if (isChecked) {
      updatedSkills = [...new Set([...currentSkills, serviceId])];
    } else {
      updatedSkills = currentSkills.filter(id => id !== serviceId);
    }
    setUserData({ ...userData, skills: updatedSkills });
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <Header />
        <div className="loading-container">Loading Profile...</div>
        <Footer />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page-container">
        <Header />
        <div className="loading-container">User not found.</div>
        <Footer />
      </div>
    );
  }

  const isTechnician = userData.role === "technician";
  
  const servicesMap = allServices.reduce((map, service) => {
    map[service.id] = service.title;
    return map;
  }, {});


  return (
    <div className="profile-page-container">
      <Header />
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
      <div className="profile-box">
        <div className="profile-header">
            <h1 className="main-title">Profile Management</h1>
            <button className={`action-btn ${isEditing ? 'save' : 'edit'}`} onClick={isEditing ? handleSave : handleEditToggle}>
                {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
        </div>

        <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-grid">
                <div>
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" value={userData.firstName || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" value={userData.lastName || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" value={userData.email || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={userData.phone || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                 <div>
                    <label htmlFor="dob">Date of Birth</label>
                    <input type="date" id="dob" name="dob" value={userData.dob || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                    <label htmlFor="gender">Gender</label>
                    <select id="gender" name="gender" value={userData.gender || ""} onChange={handleInputChange} disabled={!isEditing}>
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        </div>

        {/* RESTORED: Address Information Section */}
        <div className="form-section">
            <h3 className="section-title">Address Information</h3>
            <div className="form-grid">
                <div>
                    <label htmlFor="address">Street Address</label>
                    <input type="text" id="address" name="address" value={userData.address || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                 <div>
                    <label htmlFor="city">City</label>
                    <input type="text" id="city" name="city" value={userData.city || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                    <label htmlFor="state">State</label>
                    <input type="text" id="state" name="state" value={userData.state || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                    <label htmlFor="zipCode">ZIP Code</label>
                    <input type="text" id="zipCode" name="zipCode" value={userData.zipCode || ""} onChange={handleInputChange} disabled={!isEditing} />
                </div>
            </div>
        </div>

        {/* RESTORED: Bio Section */}
        <div className="form-section">
            <h3 className="section-title">Bio</h3>
            <textarea id="bio" name="bio" value={userData.bio || ""} onChange={handleInputChange} disabled={!isEditing} placeholder="Tell us a little about yourself..."></textarea>
        </div>

        {isTechnician && (
            <div className="form-section">
                <h3 className="section-title">Professional Details</h3>
                {/* RESTORED: Other Professional Fields */}
                <div className="form-grid">
                     <div>
                        <label htmlFor="experience">Years of Experience</label>
                        <input type="number" id="experience" name="experience" value={userData.experience || ""} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                     <div>
                        <label htmlFor="availableTimings">Available Timings</label>
                        <input type="text" id="availableTimings" name="availableTimings" value={userData.availableTimings || ""} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., 9 AM - 5 PM"/>
                    </div>
                </div>
                
                <h4 className="subsection-title">Skills & Specializations</h4>
                {isEditing ? (
                  <div className="skills-checkbox-grid">
                    {allServices.map(service => (
                      <div key={service.id} className="skill-checkbox-item">
                        <input 
                          type="checkbox"
                          id={service.id}
                          value={service.id}
                          checked={userData.skills.includes(service.id)}
                          onChange={(e) => handleSkillChange(e.target.value, e.target.checked)}
                        />
                        <label htmlFor={service.id}>{service.title}</label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="skills-grid">
                    {userData.skills.length > 0 ? userData.skills.map(skillId => (
                      <div key={skillId} className="skill-tag">
                        <span>{servicesMap[skillId] || 'Unknown Skill'}</span>
                      </div>
                    )) : <p>No skills selected.</p>}
                  </div>
                )}
            </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Profile;