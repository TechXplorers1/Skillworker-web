import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineUser,
  AiOutlinePhone,
  AiOutlineMail,
  AiOutlineHome,
  AiOutlineFileText,
  AiOutlineIdcard,
} from "react-icons/ai";
import { FaTools, FaBriefcase, FaIdCard, FaMapMarkerAlt, FaCity } from "react-icons/fa";
import "../styles/BecomeTechnician.css";

const BecomeTechnician = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    pincode: "",
    city: "",
    address: "",
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
      if (!formData.fullName) newErrors.fullName = "Full name is required.";
      if (!formData.email) newErrors.email = "Email is required.";
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email address.";
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required.";
      if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Phone number must be 10 digits.";
      if (!formData.address) newErrors.address = "Address is required.";
      if (!formData.pincode) newErrors.pincode = "Pincode is required.";
      if (!formData.city) newErrors.city = "City is required.";
    } else if (step === 2) {
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Years of experience is required.";
      if (!formData.serviceType) newErrors.serviceType = "Service type is required.";
      if (formData.serviceCategories.length === 0) newErrors.serviceCategories = "At least one service category is required.";
    } else if (step === 3) {
      if (!formData.aadharNumber) newErrors.aadharNumber = "Aadhar Number is required.";
      if (!/^\d{12}$/.test(formData.aadharNumber)) newErrors.aadharNumber = "Aadhar Number must be 12 digits.";
      if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required.";
      if (!formData.idFile) newErrors.idFile = "ID Proof is required.";
      if (!formData.policeCertificateFile) newErrors.policeCertificateFile = "Police Verification Certificate is required.";
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
            <div className="logo-section">
              <div className="logo-icon-path"></div>
              <p className="step-title">Personal Details</p>
              <p className="step-subtitle">Tell us more about yourself</p>
            </div>
            <form className="step-form">
              <div className="form-grid">
                <div>
                  <label htmlFor="fullName">Full Name</label>
                  <div className="input-with-icon">
                    <AiOutlineUser className="field-icon" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={errors.fullName ? "input-error" : ""}
                    />
                  </div>
                  {errors.fullName && <p className="error-message">{errors.fullName}</p>}
                </div>
                <div>
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <AiOutlineMail className="field-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "input-error" : ""}
                    />
                  </div>
                  {errors.email && <p className="error-message">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <div className="input-with-icon phone-input-container">
                    <span className="country-code">+91</span>
                    <AiOutlinePhone className="field-icon" />
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter your 10-digit number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={errors.phoneNumber ? "input-error" : ""}
                    />
                  </div>
                  {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
                </div>
                <div>
                  <label htmlFor="pincode">Pincode</label>
                  <div className="input-with-icon">
                    <FaMapMarkerAlt className="field-icon" />
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      placeholder="Enter your pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={errors.pincode ? "input-error" : ""}
                    />
                  </div>
                  {errors.pincode && <p className="error-message">{errors.pincode}</p>}
                </div>
                <div className="full-width">
                  <label htmlFor="address">Address</label>
                  <div className="input-with-icon">
                    <AiOutlineHome className="field-icon" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={errors.address ? "input-error" : ""}
                    />
                  </div>
                  {errors.address && <p className="error-message">{errors.address}</p>}
                </div>
                <div className="full-width">
                  <label htmlFor="city">Select your city</label>
                  <div className="input-with-icon">
                    <FaCity className="field-icon" />
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? "input-error" : ""}
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.city && <p className="error-message">{errors.city}</p>}
                </div>
              </div>
            </form>
          </>
        );
      case 2:
        return (
          <>
            <div className="logo-section">
              <div className="logo-icon-path"></div>
              <p className="step-title">Professional Details</p>
              <p className="step-subtitle">Share your expertise and experience</p>
            </div>
            <form className="step-form">
              <div className="form-grid">
                <div>
                  <label htmlFor="yearsOfExperience">Years of Experience</label>
                  <div className="input-with-icon">
                    <FaBriefcase className="field-icon" />
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      placeholder="Enter years of experience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      className={errors.yearsOfExperience ? "input-error" : ""}
                    />
                  </div>
                  {errors.yearsOfExperience && <p className="error-message">{errors.yearsOfExperience}</p>}
                </div>
                <div>
                  <label htmlFor="serviceType">Service Type</label>
                  <div className="input-with-icon">
                    <FaTools className="field-icon" />
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
                  </div>
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
          </>
        );
      case 3:
        return (
          <>
            <div className="logo-section">
              <div className="logo-icon-path"></div>
              <p className="step-title">Verification</p>
              <p className="step-subtitle">Help us verify your identity and credentials</p>
            </div>
            <form className="step-form">
              <div className="form-grid">
                <div>
                  <label htmlFor="aadharNumber">Aadhar Number</label>
                  <div className="input-with-icon">
                    <AiOutlineIdcard className="field-icon" />
                    <input
                      type="text"
                      id="aadharNumber"
                      name="aadharNumber"
                      placeholder="Enter your Aadhar number"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      className={errors.aadharNumber ? "input-error" : ""}
                    />
                  </div>
                  {errors.aadharNumber && <p className="error-message">{errors.aadharNumber}</p>}
                </div>
                <div>
                  <label htmlFor="licenseNumber">License Number</label>
                  <div className="input-with-icon">
                    <FaIdCard className="field-icon" />
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      placeholder="Enter your license number"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className={errors.licenseNumber ? "input-error" : ""}
                    />
                  </div>
                  {errors.licenseNumber && <p className="error-message">{errors.licenseNumber}</p>}
                </div>
              </div>
              <label htmlFor="idFile">Upload ID Proof</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="idFile"
                  name="idFile"
                  onChange={handleInputChange}
                  className={errors.idFile ? "input-error" : ""}
                />
              </div>
              {errors.idFile && <p className="error-message">{errors.idFile}</p>}

              <label htmlFor="policeCertificateFile">Upload Police Verification Certificate</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="policeCertificateFile"
                  name="policeCertificateFile"
                  onChange={handleInputChange}
                  className={errors.policeCertificateFile ? "input-error" : ""}
                />
              </div>
              {errors.policeCertificateFile && <p className="error-message">{errors.policeCertificateFile}</p>}
            </form>
          </>
        );
      case 4:
        return (
          <>
            <div className="logo-section">
              <div className="logo-icon-path"></div>
              <p className="step-title">Summary</p>
              <p className="step-subtitle">Please review your information</p>
            </div>
            <div className="summary-section">
              <div className="summary-group">
                <h4 className="summary-heading">Personal Details</h4>
                <div className="summary-item">
                  <p className="summary-label">Full Name:</p>
                  <p className="summary-value">{formData.fullName}</p>
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
                  <p className="summary-value">{formData.address}</p>
                </div>
                <div className="summary-item">
                  <p className="summary-label">Pincode:</p>
                  <p className="summary-value">{formData.pincode}</p>
                </div>
                <div className="summary-item">
                  <p className="summary-label">City:</p>
                  <p className="summary-value">{formData.city}</p>
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
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="become-technician-container">
      <div className="become-technician-box">
        <div className="back-arrow" onClick={handleBack}>
          &#8592;
        </div>

        <div className="step-progress-bar">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`step ${step === s ? "active" : ""} ${step > s ? "completed" : ""}`}>
              <span className="step-number">{s}</span>
            </div>
          ))}
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
  );
};

export default BecomeTechnician;