import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineUser,
  AiOutlinePhone,
  AiOutlineMail,
  AiOutlineHome,
  AiOutlineCalendar,
} from "react-icons/ai";
import { FaCity, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import "../styles/BecomeTechnician.css";
import Header from "./Header"; // Assuming Header.jsx is in the same directory

const BecomeTechnician = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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
    serviceType: "",
    serviceCategories: [],
    description: "",
    aadharNumber: "",
    licenseNumber: "",
    idFile: null,
    policeCertificateFile: null,
    declaration: false,
  });
  const [errors, setErrors] = useState({});

  const cities = ["New Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai", "Hyderabad", "Pune"];
  const serviceTypes = ["Home Maintenance", "Electronics Repair", "Automotive", "Beauty & Wellness"];
  const serviceCategoriesMap = {
    "Home Maintenance": ["Plumbing", "Electrical", "Carpentry", "Painting", "Appliance Repair"],
    "Electronics Repair": ["Mobile Repair", "Laptop Repair", "TV Repair", "Console Repair"],
    "Automotive": ["Car Wash", "Tire Repair", "Engine Diagnostics"],
    "Beauty & Wellness": ["Hair Stylist", "Makeup Artist", "Spa & Massage"],
  };

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
      if (!formData.firstName) newErrors.firstName = "First name is required.";
      if (!formData.lastName) newErrors.lastName = "Last name is required.";
      if (!formData.email) newErrors.email = "Email address is required.";
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email address.";
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required.";
      if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Phone number must be 10 digits.";
      if (!formData.dob) newErrors.dob = "Date of birth is required.";
      if (!formData.address) newErrors.address = "Address is required.";
      if (!formData.city) newErrors.city = "City is required.";
      if (!formData.state) newErrors.state = "State is required.";
      if (!formData.zipcode) newErrors.zipcode = "ZIP code is required.";
    } else if (step === 2) {
      if (!formData.aadharNumber) newErrors.aadharNumber = "Aadhar Number is required.";
      if (!/^\d{12}$/.test(formData.aadharNumber)) newErrors.aadharNumber = "Aadhar Number must be 12 digits.";
      if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required.";
      if (!formData.idFile) newErrors.idFile = "ID Proof is required.";
      if (!formData.policeCertificateFile) newErrors.policeCertificateFile = "Police Verification Certificate is required.";
    } else if (step === 3) {
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Years of experience is required.";
      if (!formData.serviceType) newErrors.serviceType = "Service type is required.";
      if (formData.serviceCategories.length === 0) newErrors.serviceCategories = "At least one service category is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleCompleteRegistration = () => {
    if (!formData.declaration) {
      setErrors({ ...errors, declaration: "You must agree to the declaration." });
      return;
    }
    console.log("Registration Complete!", formData);
    alert("Registration complete! Redirecting to homepage.");
    navigate("/");
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
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={errors.phoneNumber ? "input-error" : ""}
                    />
                    {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
                  </div>
                  <div className="full-width">
                    <label htmlFor="dob">Date of Birth</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      placeholder="dd-mm-yyyy"
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
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? "input-error" : ""}
                    />
                    {errors.city && <p className="error-message">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      placeholder="Enter your state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={errors.state ? "input-error" : ""}
                    />
                    {errors.state && <p className="error-message">{errors.state}</p>}
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
                  <div>
                    <label htmlFor="aadharNumber">Aadhar Number</label>
                    <input
                      type="text"
                      id="aadharNumber"
                      name="aadharNumber"
                      placeholder="Enter your Aadhar number"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      className={errors.aadharNumber ? "input-error" : ""}
                    />
                    {errors.aadharNumber && <p className="error-message">{errors.aadharNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="licenseNumber">License Number</label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      placeholder="Enter your license number"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className={errors.licenseNumber ? "input-error" : ""}
                    />
                    {errors.licenseNumber && <p className="error-message">{errors.licenseNumber}</p>}
                  </div>
                </div>
                <div className="file-upload-section">
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
                  <div className="file-upload-container">
                    <label htmlFor="policeCertificateFile">Upload Police Verification Certificate</label>
                    <input
                      type="file"
                      id="policeCertificateFile"
                      name="policeCertificateFile"
                      onChange={handleInputChange}
                      className={errors.policeCertificateFile ? "input-error" : ""}
                    />
                    {errors.policeCertificateFile && <p className="error-message">{errors.policeCertificateFile}</p>}
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
                  <div>
                    <label htmlFor="yearsOfExperience">Years of Experience</label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      placeholder="Enter years of experience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      className={errors.yearsOfExperience ? "input-error" : ""}
                    />
                    {errors.yearsOfExperience && <p className="error-message">{errors.yearsOfExperience}</p>}
                  </div>
                  <div className="full-width">
                    <label htmlFor="serviceType">Service Type</label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className={errors.serviceType ? "input-error" : ""}
                    >
                      <option value="">Select a service type</option>
                      {serviceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.serviceType && <p className="error-message">{errors.serviceType}</p>}
                  </div>
                </div>
                <label>Service Categories</label>
                <div className="checkbox-group">
                  {formData.serviceType &&
                    serviceCategoriesMap[formData.serviceType].map((category) => (
                      <label key={category} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="serviceCategories"
                          value={category}
                          checked={formData.serviceCategories.includes(category)}
                          onChange={handleInputChange}
                        />
                        {category}
                      </label>
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
                    <p className="summary-value">{formData.phoneNumber}</p>
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
                    <p className="summary-label">Service Type:</p>
                    <p className="summary-value">{formData.serviceType}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">Service Categories:</p>
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
                    <p className="summary-label">License Number:</p>
                    <p className="summary-value">{formData.licenseNumber}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">ID Proof:</p>
                    <p className="summary-value">{formData.idFile?.name || "Not uploaded"}</p>
                  </div>
                  <div className="summary-item">
                    <p className="summary-label">Police Certificate:</p>
                    <p className="summary-value">{formData.policeCertificateFile?.name || "Not uploaded"}</p>
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
                Complete Registration
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BecomeTechnician;