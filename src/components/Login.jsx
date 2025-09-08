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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Predefined credentials
  const predefinedCredentials = {
    "naresh@user.com": { password: "Naresh@user1", role: "user", name: "Naresh" },
    "naresh@tech.com": { password: "Naresh@tech1", role: "technician", name: "Naresh" }
  };

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  const handleBack = () => {
    navigate("/");
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Check against predefined credentials
      if (predefinedCredentials[email] && predefinedCredentials[email].password === password) {
        // Successful login with predefined credentials
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", predefinedCredentials[email].name);
        localStorage.setItem("userRole", predefinedCredentials[email].role);
        
        console.log("Login successful!", { email, password, role: predefinedCredentials[email].role });
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          
          // Check if there's a redirect URL stored
          const redirectUrl = localStorage.getItem("redirectAfterLogin");
          if (redirectUrl) {
            localStorage.removeItem("redirectAfterLogin");
            navigate(redirectUrl);
          } else {
            // If technician, show registration prompt
            if (predefinedCredentials[email].role === "technician") {
              navigate("/technician-registration-prompt");
            } else {
              navigate("/");
            }
          }
        }, 1500);
      } else {
        // For other emails, simulate successful login with user role
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", email.split('@')[0]);
        localStorage.setItem("userRole", "user");
        
        console.log("Login successful!", { email, password, role: "user" });
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          
          // Check if there's a redirect URL stored
          const redirectUrl = localStorage.getItem("redirectAfterLogin");
          if (redirectUrl) {
            localStorage.removeItem("redirectAfterLogin");
            navigate(redirectUrl);
          } else {
            navigate("/");
          }
        }, 1500);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Back Arrow */}
        <div className="back-arrow" onClick={handleBack}>
          &#8592;
        </div>

        <div className="logo-section">
          {/* Logo Path */}
          <div className="logo-icon-path"></div>
          <p className="welcome-text">Welcome back</p>
          <p className="signin-text">Sign in to access your account</p>
        </div>

        {/* Predefined credentials for testing */}
        <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '12px'}}>
          <p style={{margin: '0 0 5px 0', fontWeight: 'bold'}}>Test Credentials:</p>
          <p style={{margin: '2px 0'}}>User: naresh@user.com / Naresh@user1</p>
          <p style={{margin: '2px 0'}}>Technician: naresh@tech.com / Naresh@tech1</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <div className="input-with-icon">
            <AiOutlineMail className="field-icon" />
            <input
              type="text"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "input-error" : ""}
            />
          </div>
          {errors.email && <p className="error-message">{errors.email}</p>}

          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
            <AiOutlineLock className="field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "input-error" : ""}
            />
            <span className="eye-icon" onClick={togglePassword}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          {errors.password && <p className="error-message">{errors.password}</p>}

          <a href="#" className="forgot-link">
            Forgot your password?
          </a>

          <button type="submit" className="create-btn">
            Sign In
          </button>
        </form>

        {showSuccess && (
          <div className="success-popup">
            <div className="popup-content">
              <span className="popup-icon">&#10003;</span>
              <p>Login successful!</p>
            </div>
          </div>
        )}

        <div className="divider"></div>

        <div className="signup-inline">
          <p className="no-account-text">Don't have an account?</p>
          <p className="create-account-link" onClick={handleCreateAccount}>
            Create Account
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;