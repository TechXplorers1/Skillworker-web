import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineLock
} from "react-icons/ai";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { auth, database } from "../firebase";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    } else if (!/\S+@\S+\.\S/.test(email)) {
      newErrors.email = "Email address is invalid.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (validateForm()) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${user.uid}`));
        
        let userRole = "user"; // Default to a standard user role
        if (snapshot.exists()) {
          const userData = snapshot.val();
          userRole = userData.role;
        }

        // Store role and login status in local storage for access across the app
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("isLoggedIn", "true");

        setSuccessMessage("Login successful!");

        setTimeout(() => {
          const redirectUrl = localStorage.getItem("redirectAfterLogin");
          if (redirectUrl) {
            localStorage.removeItem("redirectAfterLogin");
            navigate(redirectUrl);
          } else if (userRole === "admin") {
            navigate("/dashboard");
          } else if (userRole === "technician") {
            navigate("/service-requests");
          } else {
            navigate("/");
          }
        }, 1500);

      } catch (error) {
        setErrorMessage("Invalid credentials. Please try again.");
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

        {successMessage && <div className="success-popup"><div className="popup-content"><span className="popup-icon">&#10003;</span><p>{successMessage}</p></div></div>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

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