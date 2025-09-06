import React from "react";
import { FaHome } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userName = localStorage.getItem("userName") || "";

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
    window.location.reload();
  };

  const handleProfile = () => {
    navigate("/profile");
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
        {isLoggedIn ? (
          <div className="user-menu">
            <span className="welcome-text">Welcome, {userName}</span>
            <button className="profile-btn" onClick={handleProfile}>
              Profile
            </button>
            <button className="signout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          <button className="signin-btn" onClick={handleSignIn}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;