import React from "react";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/signup"); // Navigates to signup.jsx
  };

  return (
    <header className="header">
      <div className="header-left">
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
