import React from "react";
import { FaHome, FaBell, FaComments, FaSignOutAlt, FaTools, FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userRole = localStorage.getItem("userRole") || "user";

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
    localStorage.removeItem("userRole");
    navigate("/");
    window.location.reload();
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleBecomeTechnician = () => {
    navigate("/become-technician");
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const handleMessages = () => {
    navigate("/messages");
  };

  const handleBookings = () => {
    navigate("/my-bookings");
  };

  const handleServiceRequests = () => {
    navigate("/service-requests");
  };

  // Get first letter of name or email for avatar
  const getAvatarLetter = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return "U";
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
      
      {isLoggedIn && userRole === "technician" ? (
        <div className="header-center">
          <button className="become-technician-btn" onClick={handleBecomeTechnician}>
            <FaTools className="technician-icon" />
            Become a Technician
          </button>
        </div>
      ) : null}
      
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-menu">
            <button className="icon-btn" onClick={handleBookings} title="My Bookings">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16">
                <path d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
              </svg>
            </button>
            
            {userRole === "technician" && (
              <button className="icon-btn" onClick={handleServiceRequests} title="Service Requests">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                  <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64zM256 192c0-17.7 14.3-32 32-32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32zm0 64c0-17.7 14.3-32 32-32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32zm0 64c0-17.7 14.3-32 32-32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32zM128 192c0-17.7 14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32zm0 64c0-17.7 14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32zm0 64c0-17.7 14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32z"/>
                </svg>
              </button>
            )}
            
            <button className="icon-btn" onClick={handleNotifications} title="Notifications">
              <FaBell className="header-icon" />
            </button>
            <button className="icon-btn" onClick={handleMessages} title="Messages">
              <FaComments className="header-icon" />
            </button>
            <div className="user-info">
              <div className="user-avatar" onClick={handleProfile} title="Profile">
                <FaUser className="user-icon" />
              </div>
              <span className="user-name">{userName || userEmail.split('@')[0]}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <FaSignOutAlt className="logout-icon" />
              Logout
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