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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/");
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!fullName) {
      newErrors.fullName = "Full name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      newErrors.fullName = "Full name should only contain alphabets and spaces.";
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate account creation
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userRole", userRole);
      
      console.log("Account created!", { fullName, email, password, role: userRole });
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
          if (userRole === "technician") {
            navigate("/technician-registration-prompt");
          } else {
            navigate("/");
          }
        }
      }, 2000);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        {/* Back Arrow */}
        <div className="back-arrow" onClick={handleBack}>
          &#8592;
        </div>

        <div className="logo-section">
          {/* Logo Path */}
          <div className="logo-icon-path"></div>
          <p className="create-account-text">Create your account</p>
          <p className="join-text">Join SkillWorkers to book services</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full Name</label>
          <div className="input-with-icon">
            <AiOutlineUser className="field-icon" />
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={errors.fullName ? "input-error" : ""}
            />
          </div>
          {errors.fullName && <p className="error-message">{errors.fullName}</p>}

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
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          {errors.password && <p className="error-message">{errors.password}</p>}

          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-with-icon">
            <AiOutlineLock className="field-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}

          <label>Account Type</label>
          <div className="role-selection">
            <div className="role-option">
              <input
                type="radio"
                id="user-role"
                name="userRole"
                value="user"
                checked={userRole === "user"}
                onChange={() => setUserRole("user")}
              />
              <label htmlFor="user-role">User</label>
            </div>
            <div className="role-option">
              <input
                type="radio"
                id="technician-role"
                name="userRole"
                value="technician"
                checked={userRole === "technician"}
                onChange={() => setUserRole("technician")}
              />
              <label htmlFor="technician-role">Technician</label>
            </div>
          </div>

          <button type="submit" className="create-btn">
            Create Account
          </button>
        </form>
        
        {showSuccess && (
          <div className="success-popup">
            <div className="popup-content">
              <span className="popup-icon">&#10003;</span>
              <p>Account created successfully!</p>
            </div>
          </div>
        )}

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