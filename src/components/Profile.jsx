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
  const [showPopup, setShowPopup] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // --- STATE FOR DATE BLOCKING ---
  const [showDateBlocker, setShowDateBlocker] = useState(false);
  const [currentBlockerMonth, setCurrentBlockerMonth] = useState(new Date().getMonth());
  const [currentBlockerYear, setCurrentBlockerYear] = useState(new Date().getFullYear());
  // ------------------------------------

  // Helper function to create a date object from YYYY-MM-DD treating it as UTC midnight
  const createUtcDate = (year, month, day) => {
    // month is 0-indexed in JS, but we want to use 1-indexed input (month)
    return new Date(Date.UTC(year, month, day));
  };
  
  const getTodayUtc = () => {
    const today = new Date();
    // Get YYYY-MM-DD string from today's local date, then parse it as UTC for comparison
    const todayStr = today.toISOString().split('T')[0]; 
    const [year, month, day] = todayStr.split('-').map(Number);
    return createUtcDate(year, month - 1, day);
  };
  

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
        // Initialize unavailableDates if it doesn't exist
        if (!data.unavailableDates) {
          data.unavailableDates = [];
        }
        setUserData(data);

        // Show popup if user is a technician and profile is incomplete
        if (data.role === "technician" && !data.isProfileComplete) {
          setShowPopup(true);
        }

      } else {
        setUserData({
          firstName: "", lastName: "", email: "", phone: "", city: "",
          state: "", zipCode: "", dob: "", gender: "", bio: "",
          role: "user", availableTimings: "", skills: [], experience: "",
          aadharNumber: "", aadharProofUrl: "",
          unavailableDates: [], // Initialize new field
          isProfileComplete: false,
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

  const validateFields = (data) => {
    const errors = {};
    
    // Phone validation (10 digits)
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
    }
    
    // Aadhar validation (12 digits)
    if (data.aadharNumber && !/^\d{12}$/.test(data.aadharNumber)) {
      errors.aadharNumber = "Aadhar number must be exactly 12 digits";
    }
    
    // Experience validation (positive number)
    if (data.experience && (isNaN(data.experience) || data.experience < 0)) {
      errors.experience = "Experience must be a positive number";
    }
    
    // Available timings validation
    if (!data.availableTimings) {
      errors.availableTimings = "Available timings is required";
    }
    
    // Skills validation (at least one)
    if (!data.skills || data.skills.length === 0) {
      errors.skills = "At least one skill must be selected";
    }
    
    // Aadhar proof validation
    if (!data.aadharProofUrl) {
      errors.aadharProofUrl = "Aadhar proof is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkProfileCompletion = (data) => {
    return (
      data.skills && data.skills.length > 0 &&
      data.phone && /^\d{10}$/.test(data.phone) &&
      data.aadharNumber && /^\d{12}$/.test(data.aadharNumber) &&
      data.aadharProofUrl && 
      data.experience && data.experience > 0 &&
      data.availableTimings
    );
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Apply restrictions based on field type
    let processedValue = value;
    
    if (name === 'phone') {
      // Restrict to 10 digits only
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'aadharNumber') {
      // Restrict to 12 digits only
      processedValue = value.replace(/\D/g, '').slice(0, 12);
    } else if (name === 'experience') {
      // Restrict to numbers only and positive values
      processedValue = value.replace(/\D/g, '');
      if (processedValue && parseInt(processedValue) < 0) {
        processedValue = '';
      }
    }
    
    setUserData({ ...userData, [name]: processedValue });
    
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic file validation
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setFieldErrors({ ...fieldErrors, aadharProofUrl: 'Please upload a valid file (JPEG, PNG, PDF)' });
        return;
      }
      
      // File size validation (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors({ ...fieldErrors, aadharProofUrl: 'File size must be less than 5MB' });
        return;
      }
      
      setUserData({ ...userData, aadharProofUrl: file.name });
      setFieldErrors({ ...fieldErrors, aadharProofUrl: '' });
    }
  };

  const handleSave = async () => {
    // Validate all fields before saving
    if (!validateFields(userData)) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const isComplete = checkProfileCompletion(userData);
        const userRef = ref(database, 'users/' + user.uid);
        await update(userRef, { ...userData, isProfileComplete: isComplete });
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
    
    // Clear skills error when user selects at least one skill
    if (updatedSkills.length > 0 && fieldErrors.skills) {
      setFieldErrors({ ...fieldErrors, skills: '' });
    }
  };

  const handlePopupAction = (action) => {
    setShowPopup(false);
    if (action === 'completeNow') {
      setIsEditing(true);
    }
  };

  // --- DATE BLOCKER LOGIC ---
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateBlockerCalendar = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const calendar = [];
    
    const todayUtc = getTodayUtc();

    for (let i = 0; i < firstDay; i++) {
      calendar.push({ day: null, date: null });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Use month (0-indexed) for Date.UTC
      const date = createUtcDate(year, month, day); 
      const dateStr = date.toISOString().split('T')[0];
      
      calendar.push({ 
        day, 
        date: dateStr,
        // Check if date is strictly before today (at UTC midnight)
        isPast: date < todayUtc, 
        isBlocked: userData?.unavailableDates?.includes(dateStr)
      });
    }
    return calendar;
  };

  const navigateBlockerMonth = (direction) => {
    const today = new Date();
    let newMonth = currentBlockerMonth;
    let newYear = currentBlockerYear;

    if (direction === 'prev') {
      newMonth = currentBlockerMonth === 0 ? 11 : currentBlockerMonth - 1;
      newYear = currentBlockerMonth === 0 ? currentBlockerYear - 1 : currentBlockerYear;

      // Prevent navigating to a month before the current one (local date check is fine here)
      if (newYear < today.getFullYear() || (newYear === today.getFullYear() && newMonth < today.getMonth())) {
        return;
      }
    } else {
      newMonth = currentBlockerMonth === 11 ? 0 : currentBlockerMonth + 1;
      newYear = currentBlockerMonth === 11 ? currentBlockerYear + 1 : currentBlockerYear;
    }
    
    setCurrentBlockerMonth(newMonth);
    setCurrentBlockerYear(newYear);
  };

  const handleDateToggle = (dayInfo) => {
    // Only allow toggling for valid future/present dates
    if (!dayInfo.date || dayInfo.isPast) return;
    
    const unavailableDates = userData.unavailableDates || [];
    let updatedDates;
    
    // Check if the date is currently blocked
    if (dayInfo.isBlocked) { 
      // Unblock date
      updatedDates = unavailableDates.filter(d => d !== dayInfo.date);
    } else {
      // Block date
      updatedDates = [...unavailableDates, dayInfo.date].sort();
    }
    
    // Optimistic UI update and prepare for save
    setUserData({ ...userData, unavailableDates: updatedDates });
  };
  
  const handleSaveUnavailableDates = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        // Save the updated list of unavailable dates
        await update(userRef, { unavailableDates: userData.unavailableDates || [] });
        setShowDateBlocker(false);
      }
    } catch (error) {
      console.error("Error saving unavailable dates:", error);
    }
  };
  // ------------------------------------

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

  // Time slots to be used in the dropdown
  const timeSlots = [
    'Morning (8:00 AM - 11:00 AM)',
    'Afternoon (12:00 PM - 3:00 PM)',
    'Evening (4:00 PM - 7:00 PM)',
  ];
  
  const blockerCalendar = generateBlockerCalendar(currentBlockerYear, currentBlockerMonth);

  // Function to render mandatory field indicator
  const MandatoryIndicator = () => <span className="mandatory-indicator">*</span>;

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
      {showPopup && isTechnician && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <p className="modal-text">Please fill up your profile to deliver services.</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => handlePopupAction('completeNow')}>Complete now</button>
              <button className="btn-secondary" onClick={() => handlePopupAction('later')}>I'll do it later</button>
            </div>
          </div>
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
                    <label htmlFor="phone">
                      Phone Number <MandatoryIndicator />
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={userData.phone || ""} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                      maxLength="10"
                      placeholder="Enter 10-digit phone number"
                    />
                    {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
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
                <div>
                    <label htmlFor="country">Country</label>
                    <input type="text" id="country" name="country" value="India" disabled />
                </div>
            </div>
        </div>

        <div className="form-section">
            <h3 className="section-title">Bio</h3>
            <textarea id="bio" name="bio" value={userData.bio || ""} onChange={handleInputChange} disabled={!isEditing} placeholder="Tell us a little about yourself..."></textarea>
        </div>

        {isTechnician && (
            <div className="form-section">
                <div className="profile-header">
                  <h3 className="section-title">Professional Details</h3>
                  <div className="availability-blocker-section">
                      <button className="block-dates-btn" onClick={() => setShowDateBlocker(true)}>
                        Set My Unavailable Dates
                      </button>
                    </div>
                </div>
                
                <div className="form-grid">
                     <div>
                        <label htmlFor="experience">
                          Years of Experience <MandatoryIndicator />
                        </label>
                        <input 
                          type="number" 
                          id="experience" 
                          name="experience" 
                          value={userData.experience || ""} 
                          onChange={handleInputChange} 
                          disabled={!isEditing}
                          min="0"
                          placeholder="Enter years of experience"
                        />
                        {fieldErrors.experience && <span className="field-error">{fieldErrors.experience}</span>}
                    </div>
                     <div>
                        <label htmlFor="availableTimings">
                          Available Timings <MandatoryIndicator />
                        </label>
                        <select
                          id="availableTimings"
                          name="availableTimings"
                          value={userData.availableTimings || ""}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        >
                          <option value="">Select a time slot...</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                        {fieldErrors.availableTimings && <span className="field-error">{fieldErrors.availableTimings}</span>}
                    </div>
                     <div>
                        <label htmlFor="aadharNumber">
                          Aadhar Number <MandatoryIndicator />
                        </label>
                        <input
                          type="text"
                          id="aadharNumber"
                          name="aadharNumber"
                          value={userData.aadharNumber || ""}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          maxLength="12"
                          placeholder="Enter 12-digit Aadhar number"
                        />
                        {fieldErrors.aadharNumber && <span className="field-error">{fieldErrors.aadharNumber}</span>}
                    </div>
                    <div>
                        <label htmlFor="aadharProofUrl">
                          Aadhar Proof <MandatoryIndicator />
                        </label>
                        <input
                          type="file"
                          id="aadharProofUrl"
                          name="aadharProofUrl"
                          onChange={handleFileChange}
                          disabled={!isEditing}
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                         {userData.aadharProofUrl && <p className="file-name">{userData.aadharProofUrl}</p>}
                         {fieldErrors.aadharProofUrl && <span className="field-error">{fieldErrors.aadharProofUrl}</span>}
                    </div>
                </div>
                
                <h4 className="subsection-title">
                  Skills & Specializations <MandatoryIndicator />
                </h4>
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
                    {fieldErrors.skills && <span className="field-error">{fieldErrors.skills}</span>}
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

      {/* --- DATE BLOCKER MODAL --- */}
      {showDateBlocker && (
        <div className="modal-backdrop date-blocker-overlay">
          <div className="modal-content date-blocker-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="section-title">Set Unavailable Dates</h3>
            <p className="modal-text">Click on a date to toggle your unavailability.</p>
            <div className="calendar-header">
              <div className="calendar-nav">
                <button onClick={() => navigateBlockerMonth('prev')}>&larr; Prev</button>
                <span className="calendar-month">{monthNames[currentBlockerMonth]} {currentBlockerYear}</span>
                <button onClick={() => navigateBlockerMonth('next')}>Next &rarr;</button>
              </div>
            </div>
            
            <div className="calendar-grid">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              
              {blockerCalendar.map((dayInfo, index) => (
                <div
                  key={index}
                  className={`calendar-day ${
                    dayInfo.day === null ? 'empty' : 
                    dayInfo.isPast ? 'past' : 
                    dayInfo.isBlocked ? 'blocked-date' : ''
                  }`}
                  onClick={() => handleDateToggle(dayInfo)}
                >
                  {dayInfo.day}
                </div>
              ))}
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleSaveUnavailableDates}>Save Dates</button>
              <button className="btn-primary" onClick={() => setShowDateBlocker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer/>
    </div>
  );
};

export default Profile;