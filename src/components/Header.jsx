import React from "react";
import { FaHome } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = () => {
    navigate("/signup"); // Navigates to signup.jsx
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      // Already on homepage → scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to homepage
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div
        className="header-left"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      >
        <FaHome className="header-icon" />
        <h2 className="header-logo">SkillWorkers</h2>
      </div>
      <div className="header-right">
        <button className="signin-btn" onClick={handleSignIn}>
          Sign In
        </button>
      </div>
    </header>
  );
};

export default Header;
