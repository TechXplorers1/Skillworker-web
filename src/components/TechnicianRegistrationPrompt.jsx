import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TechnicianRegistrationPrompt.css";

const TechnicianRegistrationPrompt = () => {
  const navigate = useNavigate();

  const handleCompleteRegistration = () => {
    navigate("/become-technician");
  };

  const handleDoLater = () => {
    navigate("/");
  };

  return (
    <div className="technician-prompt-container">
      <div className="technician-prompt-box">
        <div className="prompt-header">
          <h2>Complete Your Technician Profile</h2>
          <p>To start offering your services, we need some additional information about your skills and experience.</p>
        </div>
        
        <div className="prompt-content">
          <div className="benefits-list">
            <h3>Benefits of completing your technician profile:</h3>
            <ul>
              <li>Start receiving service requests from customers</li>
              <li>Build your reputation with reviews and ratings</li>
              <li>Set your own pricing and availability</li>
              <li>Get paid for your skills and expertise</li>
            </ul>
          </div>
        </div>
        
        <div className="prompt-actions">
          <button className="complete-btn" onClick={handleCompleteRegistration}>
            Complete Registration
          </button>
          <button className="later-btn" onClick={handleDoLater}>
            I'll Do It Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianRegistrationPrompt;