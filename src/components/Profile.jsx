import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ref, get, update, onValue } from "firebase/database";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaPencilAlt, FaTimes, FaSave, FaEdit } from "react-icons/fa"; // Import icons
import "../styles/Profile.css";

// --- IN-MEMORY CACHE ---
let allServicesCache = null;

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [blinkingField, setBlinkingField] = useState(null);

  // --- NEW STATE: For the technician activity toggle ---
  const [isTechnicianActive, setIsTechnicianActive] = useState(false);

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
        const data = await fetchUserData(user.uid);
        if (data) {
          await fetchAllServices(data.role);
        }
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

        // FIX: Always set the technician's active status from fetched data
        setIsTechnicianActive(data.isActive || false);
        return data;

      } else {
        const defaultData = {
          firstName: "", lastName: "", email: "", phone: "",
          address: "", city: "", state: "", zipCode: "",
          dob: "", gender: "", bio: "",
          role: "user", availableTimings: "", skills: [], experience: "",
          aadharNumber: "", aadharProofUrl: "",
          unavailableDates: [], // Initialize new field
          isProfileComplete: false,
          isActive: false, // Add default isActive field
        };
        setUserData(defaultData);
        setIsTechnicianActive(false);
        return defaultData;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllServices = async (role) => {
    // Only fetch services for technicians (needed for skills selection)
    if (role !== 'technician') {
      return;
    }

    // 1. Check Cache
    if (allServicesCache) {
      setAllServices(allServicesCache);
      return;
    }

    // 2. Fetch if not in cache
    const servicesRef = ref(database, 'services');
    try {
      const snapshot = await get(servicesRef);
      const servicesData = snapshot.val();
      if (servicesData) {
        const servicesList = Object.entries(servicesData).map(([id, data]) => ({
          id,
          title: data.title,
        }));

        // 3. Save to Cache
        allServicesCache = servicesList;
        setAllServices(servicesList);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // UPDATED: Return the name of the first field that fails validation
  const validateFields = (data) => {
    const errors = {};
    let firstErrorField = null;

    // Define a helper to check and set the first error
    const checkError = (name, condition, message) => {
      if (condition) {
        errors[name] = message;
        if (!firstErrorField) {
          firstErrorField = name;
        }
      }
    };

    // Phone validation (10 digits) - for ALL users
    checkError('phone', !data.phone || !/^\d{10}$/.test(data.phone), "Phone number must be exactly 10 digits");

    // Address validation (mandatory) - for ALL users
    checkError('address', !data.address || data.address.trim() === "", "Street address is required");

    // City validation (mandatory) - for ALL users
    checkError('city', !data.city || data.city.trim() === "", "City is required");

    // State validation (mandatory) - for ALL users
    checkError('state', !data.state || data.state.trim() === "", "State is required");

    // ZIP Code validation (mandatory, 6 digits) - for ALL users
    checkError('zipCode', !data.zipCode || !/^\d{6}$/.test(data.zipCode), "ZIP code must be exactly 6 digits");

    // Technician-specific validations
    if (data.role === "technician") {
      // Experience validation (mandatory, positive number or zero)
      checkError('experience', !data.experience || isNaN(data.experience) || parseInt(data.experience) < 0, "Experience must be a positive number or zero");

      // Available timings validation (mandatory)
      checkError('availableTimings', !data.availableTimings, "Available timings is required");

      // Aadhar validation (mandatory, 12 digits)
      checkError('aadharNumber', !data.aadharNumber || !/^\d{12}$/.test(data.aadharNumber), "Aadhar number must be exactly 12 digits");

      // Aadhar proof validation (mandatory)
      checkError('aadharProofUrl', !data.aadharProofUrl, "Aadhar proof is required");

      // Skills validation (at least one)
      checkError('skills', !data.skills || data.skills.length === 0, "At least one skill must be selected");
    }

    setFieldErrors(errors);
    // Return the name of the first error field, or null if validation passes
    return firstErrorField;
  };

  // FIXED: Handler for the technician activity toggle switch
  const handleToggleStatus = async () => {
    const newStatus = !isTechnicianActive;
    const user = auth.currentUser;
    if (user && userData?.role === 'technician') {
      try {
        const userRef = ref(database, `users/${user.uid}`);
        // Update both Firebase and local state
        await update(userRef, { isActive: newStatus });

        // Update both the toggle state and userData state
        setIsTechnicianActive(newStatus);
        setUserData(prevData => ({
          ...prevData,
          isActive: newStatus
        }));

        console.log("Technician status updated to:", newStatus);
      } catch (error) {
        console.error("Failed to update technician status:", error);
      }
    }
  };


  const checkProfileCompletion = (data) => {
    // For ALL users, check basic profile completion
    const basicComplete = (
      data.phone && /^\d{10}$/.test(data.phone) &&
      data.address && data.address.trim() !== "" &&
      data.city && data.city.trim() !== "" &&
      data.state && data.state.trim() !== "" &&
      data.zipCode && /^\d{6}$/.test(data.zipCode)
    );

    // For technicians, also check professional details
    if (data.role === "technician") {
      return basicComplete && (
        data.skills && data.skills.length > 0 &&
        data.aadharNumber && /^\d{12}$/.test(data.aadharNumber) &&
        data.aadharProofUrl &&
        data.experience && data.experience >= 0 &&
        data.availableTimings
      );
    }

    return basicComplete;
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Apply restrictions based on field type
    let processedValue = value;

    if (name === 'phone') {
      // Restrict to 10 digits only
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'zipCode') {
      // Restrict to 6 digits only
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    } else if (name === 'aadharNumber') {
      // Restrict to 12 digits only
      processedValue = value.replace(/\D/g, '').slice(0, 12);
    } else if (name === 'experience') {
      // Restrict to numbers only and positive values or zero
      processedValue = value.replace(/\D/g, '');
    }

    setUserData({ ...userData, [name]: processedValue });

    // Clear error when user starts typing and stop blinking
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
      if (blinkingField === name) {
        setBlinkingField(null);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    if (file) {
      // Basic file validation
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setFieldErrors({ ...fieldErrors, [name]: 'Please upload a valid file (JPEG, PNG, PDF)' });
        return;
      }

      // File size validation (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors({ ...fieldErrors, [name]: 'File size must be less than 5MB' });
        return;
      }

      setUserData({ ...userData, [name]: file.name });
      setFieldErrors({ ...fieldErrors, [name]: '' });
      if (blinkingField === name) {
        setBlinkingField(null);
      }
    } else {
      // This clears the file name if the user clears the file input
      setUserData({ ...userData, [name]: "" });
    }
  };

  // UPDATED: Scroll to the first invalid field and make it blink
  const handleSave = async () => {
    // Validate all fields before saving
    const firstErrorField = validateFields(userData);

    if (firstErrorField) {
      // Validation failed. Scroll to and highlight the first error field.
      const element = document.getElementById(firstErrorField);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Set the state to start the blinking animation
        setBlinkingField(firstErrorField);

        // Remove the blinking class after the animation is done (e.g., 2 seconds)
        setTimeout(() => setBlinkingField(null), 2000);
      }
      return;
    }

    // Validation passed, proceed with save
    try {
      const user = auth.currentUser;
      if (user) {
        const isComplete = checkProfileCompletion(userData);
        const userRef = ref(database, 'users/' + user.uid);
        await update(userRef, { ...userData, isProfileComplete: isComplete });

        // Remove the popup flag when profile is completed
        if (isComplete) {
          localStorage.removeItem('showProfilePopup');
        }

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

    // Clear skills error when user selects at least one skill and stop blinking
    if (updatedSkills.length > 0) {
      if (fieldErrors.skills) {
        setFieldErrors({ ...fieldErrors, skills: '' });
      }
      if (blinkingField === 'skills') {
        setBlinkingField(null);
      }
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
    'Ok With Any Time Slot'
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
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <span>Profile saved successfully!</span>
        </div>
      )}

      <div className="profile-box">
        <div className="profile-header">
          <h1 className="main-title">Profile Management</h1>
          <div className="profile-header-actions">
            {/* --- FIXED: Activity Toggle for Technicians --- */}
            {isTechnician && (
              <div className="cyber-toggle-wrapper-profile">
                <input
                  className="cyber-toggle-checkbox"
                  id="cyber-toggle-profile"
                  type="checkbox"
                  checked={isTechnicianActive}
                  onChange={handleToggleStatus}
                />
                <label className="cyber-toggle" htmlFor="cyber-toggle-profile">
                  <div className="cyber-toggle-track">
                    <div className="cyber-toggle-track-glow" />
                    <div className="cyber-toggle-track-dots">
                      <span className="cyber-toggle-track-dot" />
                      <span className="cyber-toggle-track-dot" />
                      <span className="cyber-toggle-track-dot" />
                    </div>
                  </div>
                  <div className="cyber-toggle-thumb">
                    <div className="cyber-toggle-thumb-shadow" />
                    <div className="cyber-toggle-thumb-highlight" />
                    <div className="cyber-toggle-thumb-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-2.48-2.02-4.5-4.5-4.5s-4.5 2.02-4.5 4.5 2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5zm-4.5 7.5c-4.14 0-7.5-3.36-7.5-7.5s3.36-7.5 7.5-7.5 7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5zm0-16.5c-4.97 0-9 4.03-9 9h-3l3.89 3.89.07.14 4.04-4.03h-3c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42c1.63 1.63 3.87 2.64 6.36 2.64 4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="cyber-toggle-particles">
                    <span className="cyber-toggle-particle" />
                    <span className="cyber-toggle-particle" />
                    <span className="cyber-toggle-particle" />
                    <span className="cyber-toggle-particle" />
                  </div>
                </label>
                <div className="cyber-toggle-labels">
                  <span className="cyber-toggle-label-off">OFFLINE</span>
                  <span className="cyber-toggle-label-on">ONLINE</span>
                </div>
              </div>
            )}
            {/* --- END of Activity Toggle --- */}

            <button
              className={`action-btn ${isEditing ? 'cancel' : 'edit-icon'}`}
              onClick={handleEditToggle}
              title={isEditing ? "Cancel Editing" : "Edit Profile"}
            >
              {isEditing ? (
                <>
                  <FaTimes />
                  <span className="btn-text">&nbsp;Cancel</span>
                </>
              ) : (
                <>
                  <FaEdit />
                  <span className="btn-text">&nbsp;Edit Profile</span>
                </>
              )}
            </button>
          </div>
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
                className={blinkingField === 'phone' ? 'input-blink-error' : ''}
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
              <label htmlFor="address">
                Street Address <MandatoryIndicator />
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={userData.address || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your street address"
                className={blinkingField === 'address' ? 'input-blink-error' : ''}
              />
              {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
            </div>
            <div>
              <label htmlFor="city">
                City <MandatoryIndicator />
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={userData.city || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your city"
                className={blinkingField === 'city' ? 'input-blink-error' : ''}
              />
              {fieldErrors.city && <span className="field-error">{fieldErrors.city}</span>}
            </div>
            <div>
              <label htmlFor="state">
                State <MandatoryIndicator />
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={userData.state || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your state"
                className={blinkingField === 'state' ? 'input-blink-error' : ''}
              />
              {fieldErrors.state && <span className="field-error">{fieldErrors.state}</span>}
            </div>
            <div>
              <label htmlFor="zipCode">
                ZIP Code <MandatoryIndicator />
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={userData.zipCode || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                maxLength="6"
                placeholder="Enter 6-digit ZIP code"
                className={blinkingField === 'zipCode' ? 'input-blink-error' : ''}
              />
              {fieldErrors.zipCode && <span className="field-error">{fieldErrors.zipCode}</span>}
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
            <div className="professional-details-header">
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
                  className={blinkingField === 'experience' ? 'input-blink-error' : ''}
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
                  className={blinkingField === 'availableTimings' ? 'input-blink-error' : ''}
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
                  className={blinkingField === 'aadharNumber' ? 'input-blink-error' : ''}
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
                {fieldErrors.aadharProofUrl && <span className="field-error" id="aadharProofUrl-error">{fieldErrors.aadharProofUrl}</span>}
              </div>
            </div>

            <h4 className="subsection-title" id="skills-section-title">
              Skills & Specializations <MandatoryIndicator />
            </h4>
            {isEditing ? (
              <div className={`skills-checkbox-grid ${blinkingField === 'skills' ? 'input-blink-error' : ''}`} id="skills">
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

        {isEditing && (
          <div className="profile-action-footer">
            <button
              className="action-btn save"
              onClick={handleSave}
            >
              <FaSave />&nbsp;Save Changes
            </button>
          </div>
        )}
      </div>

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
                  className={`calendar-day ${dayInfo.day === null ? 'empty' :
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

      <Footer />
    </div>
  );
};

export default Profile;