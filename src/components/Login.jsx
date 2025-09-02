import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineLock
} from "react-icons/ai";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  const handleBack = () => {
    navigate("/homepage");
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Back Arrow */}
        <div className="back-arrow" onClick={handleBack}>
          &#8592;
        </div>

        <div className="logo-section">
          <div className="logo-icon">🔧</div>
          <h1 className="brand-name">SkillWorkers</h1>
          <p className="welcome-text">Welcome back</p>
          <p className="signin-text">Sign in to access your account</p>
        </div>

        <form className="login-form">
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
            <span className="eye-icon" onClick={togglePassword}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <a href="#" className="forgot-link">
            Forgot your password?
          </a>

          <button type="submit" className="signin-btn">
            Sign In
          </button>
        </form>

        <div className="divider"></div>

        <p className="no-account-text">Don't have an account?</p>
        <button className="create-account-btn" onClick={handleCreateAccount}>
          Create Account
        </button>
      </div>
    </div>
  );
};

export default Login;
