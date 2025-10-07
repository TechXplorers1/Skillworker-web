import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const validateEmail = () => {
    if (!email) {
      setError("Email is required.");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email address is invalid.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Please check your inbox.");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setErrorMessage("No user found with this email address.");
      } else {
        setErrorMessage("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const css = `
    .forgot-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f0f7ff, #faf5ff);
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }
    .forgot-password-box {
      background: #fff;
      padding: 30px 40px;
      border-radius: 15px;
      width: 500px;
      max-width: 90%;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
      text-align: center;
      position: relative;
    }
    .back-arrow {
      position: absolute;
      top: 15px;
      left: 15px;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      color: #333;
    }
    .logo-section {
      margin-top: 20px;
    }
    .title-text {
      font-size: 22px;
      margin: 10px 0 8px;
      font-weight: 600;
      color: #333;
    }
    .description-text {
      font-size: 14px;
      color: #666;
      margin-bottom: 25px;
    }
    .forgot-password-form {
      text-align: left;
    }
    .forgot-password-form label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .input-with-icon {
      position: relative;
      margin-bottom: 18px;
    }
    .field-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: #666;
    }
    .input-with-icon input {
      width: 100%;
      padding: 12px 12px 12px 36px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .input-with-icon input.input-error {
      border-color: #e74c3c;
    }
    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: -10px;
      margin-bottom: 10px;
      text-align: left;
    }
    .success-message-box {
      background-color: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #a5d6a7;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }
    .success-message-box p {
      margin: 0;
      font-size: 14px;
    }
    .reset-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #6a6fff, #b66fff);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
    }
    .reset-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <div className="back-arrow" onClick={handleBackToLogin}>
            &#8592;
          </div>

          <div className="logo-section">
            <h2 className="title-text">Forgot Password?</h2>
            <p className="description-text">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {successMessage && (
            <div className="success-message-box">
              <p>{successMessage}</p>
            </div>
          )}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
               <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 1024 1024"
                className="field-icon"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 110.8V792H136V270.8l-27.6-21.5 39.3-50.5 42.8 33.3h643.1l42.8-33.3 39.3 50.5-27.7 21.5zM832 240H192v102.4l320 248.2 320-248.2V240zm-320 328.2L136 324.7v429.1h752V324.7L512 568.2z"></path>
              </svg>
              <input
                type="text"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error ? "input-error" : ""}
              />
            </div>
            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="reset-btn" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;

