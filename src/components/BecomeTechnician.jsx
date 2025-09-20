import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineUser,
  AiOutlinePhone,
  AiOutlineMail,
  AiOutlineHome,
  AiOutlineCalendar,
} from "react-icons/ai";
import { FaCity, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import { ref, set } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../firebase";
import "../styles/BecomeTechnician.css";
import Header from "./Header";

const BecomeTechnician = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    yearsOfExperience: "",
    serviceCategories: [],
    description: "",
    aadharNumber: "",
    idFile: null,
    declaration: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setFormData((prevData) => ({
          ...prevData,
          email: user.email || "",
        }));
      } else {
        // Redirect to login if not authenticated
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const statesAndCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
    "Arunachal Pradesh": ["Itanagar"],
    "Assam": ["Guwahati", "Dibrugarh"],
    "Bihar": ["Patna", "Gaya"],
    "Chhattisgarh": ["Raipur", "Bilaspur"],
    "Goa": ["Panaji", "Margao"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
    "Haryana": ["Faridabad", "Gurgaon"],
    "Himachal Pradesh": ["Shimla"],
    "Jharkhand": ["Ranchi", "Jamshedpur"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima"],
    "Odisha": ["Bhubaneswar", "Cuttack"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
    "Sikkim": ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Telangana": ["Hyderabad", "Warangal"],
    "Tripura": ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar"],
    "West Bengal": ["Kolkata", "Howrah"],
    "Delhi": ["New Delhi"],
  };

  const allServices = [
    "Plumber",
    "Electrician",
    "Ac Mechanic",
    "Carpenter",
    "Packers & Movers",
    "House cleaners",
    "laundry",
    "Construction cleaners",
    "surveyors",
    "camera fiitings",
    "welders",
    "private investigators",
    "Body Massage",
  ];

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      if (name === "serviceCategories") {
        setFormData((prevData) => {
          const newCategories = checked
            ? [...prevData.serviceCategories, value]
            : prevData.serviceCategories.filter((cat) => cat !== value);
          return { ...prevData, serviceCategories: newCategories };
        });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      // First Name validation
      if (!formData.firstName) {
        newErrors.firstName = "First name is required.";
      } else if (!/^[A-Za-z]+$/.test(formData.firstName)) {
        newErrors.firstName = "First name must contain only alphabets.";
      } else if (formData.firstName.length > 15) {
        newErrors.firstName = "First name cannot exceed 15 characters.";
      }
      // Last Name validation
      if (!formData.lastName) {
        newErrors.lastName = "Last name is required.";
      } else if (!/^[A-Za-z]+$/.test(formData.lastName)) {
        newErrors.lastName = "Last name must contain only alphabets.";
      } else if (formData.lastName.length > 15) {
        newErrors.lastName = "Last name cannot exceed 15 characters.";
      }
      // Email validation
      if (!formData.email) {
        newErrors.email = "Email address is required.";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Invalid email address.";
      }
      // Phone Number validation
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required.";
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
      }
      // DOB validation (min 18 years old)
      if (!formData.dob) {
        newErrors.dob = "Date of birth is required.";
      } else {
        const today = new Date();
        const birthDate = new Date(formData.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.dob = "You must be at least 18 years old.";
        }
      }
      // Address validation
      if (!formData.address) newErrors.address = "Address is required.";
      // City validation
      if (!formData.city) newErrors.city = "City is required.";
      // State validation
      if (!formData.state) newErrors.state = "State is required.";
      // ZIP Code validation
      if (!formData.zipcode) {
        newErrors.zipcode = "ZIP code is required.";
      } else if (!/^\d{6}$/.test(formData.zipcode)) {
        newErrors.zipcode = "ZIP code must be exactly 6 digits.";
      }
    } else if (step === 2) {
      // Aadhar Number validation
      if (!formData.aadharNumber) {
        newErrors.aadharNumber = "Aadhar Number is required.";
      } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
        newErrors.aadharNumber = "Aadhar Number must be exactly 12 digits.";
      }
      // File upload validation
      if (!formData.idFile) newErrors.idFile = "ID Proof is required.";
    } else if (step === 3) {
      // Years of Experience validation
      if (!formData.yearsOfExperience) {
        newErrors.yearsOfExperience = "Years of experience is required.";
      } else if (parseInt(formData.yearsOfExperience, 10) < 0) {
        newErrors.yearsOfExperience = "Experience cannot be negative.";
      }
      // Service Categories validation
      if (formData.serviceCategories.length === 0) newErrors.serviceCategories = "At least one service is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!currentUserId) {
        alert("Authentication error. Please log in again.");
        return;
    }
    if (!formData.declaration) {
      setErrors({ ...errors, declaration: "You must agree to the declaration." });
      return;
    }

    try {
      // Data to be saved to the database
      const technicianData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: `+91${formData.phoneNumber}`,
        dob: formData.dob,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipcode,
        yearsOfExperience: formData.yearsOfExperience,
        skills: formData.serviceCategories,
        bio: formData.description,
        role: "technician",
        status: "pending_verification",
        uid: currentUserId,
        // In a real app, you would handle file uploads to storage here.
        // For this example, we'll just store the Aadhar number.
        aadharNumber: formData.aadharNumber,
        // other fields can be added as needed
      };

      const userRef = ref(database, `users/${currentUserId}`);
      await set(userRef, technicianData);

      alert("Registration complete! Your application is pending review.");
      navigate("/");
      window.location.reload(); // Force a reload to update the header
    } catch (error) {
      console.error("Error submitting technician registration: ", error);
      alert("An error occurred during registration. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <form className="step-form">
                <div className="form-grid-three">
                  <div>
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? "input-error" : ""}
                    />
                    {errors.firstName && <p className="error-message">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? "input-error" : ""}
                    />
                    {errors.lastName && <p className="error-message">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "input-error" : ""}
                    />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <div className="phone-input-group">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="Enter 10-digit number"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        maxLength="10"
                        className={errors.phoneNumber ? "input-error" : ""}
                      />
                    </div>
                    {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
                  </div>
                  <div className="full-width">
                    <label htmlFor="dob">Date of Birth</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={errors.dob ? "input-error" : ""}
                    />
                    {errors.dob && <p className="error-message">{errors.dob}</p>}
                  </div>
                  <div className="full-width">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Enter your street address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={errors.address ? "input-error" : ""}
                    />
                    {errors.address && <p className="error-message">{errors.address}</p>}
                  </div>
                  <div>
                    <label htmlFor="state">State</label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={errors.state ? "input-error" : ""}
                    >
                      <option value="">Select a state</option>
                      {Object.keys(statesAndCities).sort().map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                    </select>
                    {errors.state && <p className="error-message">{errors.state}</p>}
                  </div>
                  <div>
                    <label htmlFor="city">City</label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? "input-error" : ""}
                      disabled={!formData.state}
                    >
                      <option value="">Select a city</option>
                      {formData.state &&
                        statesAndCities[formData.state].sort().map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                    </select>
                    {errors.city && <p className="error-message">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="zipcode">ZIP Code</label>
                    <input
                      type="text"
                      id="zipcode"
                      name="zipcode"
                      placeholder="Enter your ZIP code"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      maxLength="6"
                      className={errors.zipcode ? "input-error" : ""}
                    />
                    {errors.zipcode && <p className="error-message">{errors.zipcode}</p>}
                  </div>
                </div>
              </form>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="form-section">
              <h3 className="section-title">Identity Verification</h3>
              <form className="step-form">
                <div className="form-grid-three">
                  <div className="full-width">
                    <label htmlFor="aadharNumber">Aadhar Number</label>
                    <input
                      type="text"
                      id="aadharNumber"
                      name="aadharNumber"
                      placeholder="Enter your Aadhar number"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      maxLength="12"
                      className={errors.aadharNumber ? "input-error" : ""}
                    />
                    {errors.aadharNumber && <p className="error-message">{errors.aadharNumber}</p>}
                  </div>
                </div>
                <div className="file-upload-section single-upload">
                  <div className="file-upload-container">
                    <label htmlFor="idFile">Upload ID Proof</label>
                    <input
                      type="file"
                      id="idFile"
                      name="idFile"
                      onChange={handleInputChange}
                      className={errors.idFile ? "input-error" : ""}
                    />
                    {errors.idFile && <p className="error-message">{errors.idFile}</p>}
                  </div>
                </div>
              </form>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="form-section">
              <h3 className="section-title">Professional Details</h3>
              <form className="step-form">
                <div className="form-grid-three">
                  <div className="full-width">
                    <label htmlFor="yearsOfExperience">Years of Experience</label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      placeholder="Enter years of experience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      min="0"
                      className={errors.yearsOfExperience ? "input-error" : ""}
                    />
                    {errors.yearsOfExperience && <p className="error-message">{errors.yearsOfExperience}</p>}
                  </div>
                </div>
                <label>Services you provide</label>
                <div className="service-selection-grid">
                  {allServices.map((service) => (
                    <div className="service-checkbox" key={service}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="serviceCategories"
                          value={service}
                          checked={formData.serviceCategories.includes(service)}
                          onChange={handleInputChange}
                        />
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.serviceCategories && <p className="error-message">{errors.serviceCategories}</p>}
                <label htmlFor="description">Description about your expertise</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about your skills and professional background."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </form>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="form-section">
              <h3 className="section-title">Summary</h3>
              <div className="summary-section">
                <div className="summary-group">
                  <h4 className="summary-heading">Personal Details</h4>
                  <div className="summary-item">
                    <p className="summary-label">Full Name:</p>
                    <p className="summary-value">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">Email:</p>
                    <p className="summary-value">{formData.email}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">Phone Number:</p>
                    <p className="summary-value">+91 {formData.phoneNumber}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">Address:</p>
                    <p className="summary-value">{formData.address}, {formData.city}, {formData.state} {formData.zipcode}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">Date of Birth:</p>
                    <p className="summary-value">{formData.dob}</p>
                  </div>
                </div>
                <div className="summary-group">
                  <h4 className="summary-heading">Professional Details</h4>
                  <div className="summary-item">
                    <p className="summary-label">Years of Experience:</p>
                    <p className="summary-value">{formData.yearsOfExperience}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">Services:</p>
                    <p className="summary-value">{formData.serviceCategories.join(", ")}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">Description:</p>
                    <p className="summary-value">{formData.description || "Not provided"}</p>
                  </div>
                </div>
                <div className="summary-group">
                  <h4 className="summary-heading">Verification Details</h4>
                  <div className="summary-item">
                    <p className="summary-label">Aadhar Number:</p>
                    <p className="summary-value">{formData.aadharNumber}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">ID Proof:</p>
                    <p className="summary-value">{formData.idFile?.name || "Not uploaded"}</p>
                  </div>
                </div>
              </div>
              <div className="declaration-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="declaration"
                    checked={formData.declaration}
                    onChange={handleInputChange}
                  />
                  I declare that all the information provided above is true to the best of my knowledge.
                </label>
                {errors.declaration && <p className="error-message">{errors.declaration}</p>}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="become-technician-container">
        <div className="become-technician-box">
          <h1 className="main-title">Become a Technician</h1>
          <p className="subtitle">Join our network of skilled professionals</p>
          <div className="step-progress-bar">
            <div className={`step ${step === 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
              <span className="step-number">1</span>
              <span className="step-label">Personal</span>
            </div>
            <div className={`step ${step === 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
              <span className="step-number">2</span>
              <span className="step-label">Identity</span>
            </div>
            <div className={`step ${step === 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
              <span className="step-number">3</span>
              <span className="step-label">Professional</span>
            </div>
            <div className={`step ${step === 4 ? "active" : ""} ${step > 4 ? "completed" : ""}`}>
              <span className="step-number">4</span>
              <span className="step-label">Final</span>
            </div>
          </div>
          {renderStep()}
          <div className="step-navigation">
            {step > 1 && (
              <button className="back-btn" onClick={() => setStep(step - 1)}>
                Previous
              </button>
            )}
            {step < 4 && (
              <button className="next-btn" onClick={handleNext}>
                Next
              </button>
            )}
            {step === 4 && (
              <button className="complete-btn" onClick={handleCompleteRegistration}>
                Submit Registration
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BecomeTechnician;