import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineUser
} from "react-icons/ai";
import "../styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignIn = () => {
    navigate("/");
  };

  const handleBack = () => {
    navigate("/homepage");
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        {/* Back Arrow */}
        <div className="back-arrow" onClick={handleBack}>
          &#8592;
        </div>

        <div className="logo-section">
          <div className="logo-icon">🔧</div>
          <h1 className="brand-name">SkillWorkers</h1>
          <p className="create-account-text">Create your account</p>
          <p className="join-text">Join SkillWorkers to book services</p>
        </div>

        <form className="signup-form">
          <label>Full Name</label>
          <div className="input-with-icon">
            <AiOutlineUser className="field-icon" />
            <input type="text" placeholder="Enter your full name" />
          </div>

          <label>Email Address</label>
          <div className="input-with-icon">
            <AiOutlineMail className="field-icon" />
            <input type="email" placeholder="Enter your email" />
          </div>

          <label>Password</label>
          <div className="input-with-icon">
            <AiOutlineLock className="field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <label>Confirm Password</label>
          <div className="input-with-icon">
            <AiOutlineLock className="field-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
            />
            <span
              className="eye-icon"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible />
              ) : (
                <AiOutlineEye />
              )}
            </span>
          </div>

          <button type="submit" className="create-btn">
            Create Account
          </button>
        </form>

        <div className="divider"></div>

        <div className="signin-inline">
          <p className="already-text">Already have an account?</p>
          <p className="signin-link" onClick={handleSignIn}>
            Sign In
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
