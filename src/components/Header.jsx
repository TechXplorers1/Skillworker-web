import React from "react";
import { 
  HiOutlineBell, 
  HiOutlineUser
} from "react-icons/hi";
import { 
  MdOutlineHandyman, 
  MdOutlineWorkOutline
} from "react-icons/md";
import { 
  FiLogOut,
  FiMessageSquare
} from "react-icons/fi";
import { 
  RiCalendarEventLine,
  RiDashboardLine
} from "react-icons/ri";
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

  const handleDashboard = () => {
    navigate("/user-management");
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
        <h2 className="header-logo">SkillWorkers</h2>
      </div>
      
      {isLoggedIn && userRole === "technician" ? (
        <div className="header-center">
          <button className="become-technician-btn" onClick={handleBecomeTechnician}>
            <MdOutlineHandyman className="technician-icon" />
            Become a Technician
          </button>
        </div>
      ) : null}
      
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-menu">
            <button className="icon-btn" onClick={handleBookings} title="My Bookings">
              <RiCalendarEventLine className="header-icon" />
            </button>
            
            {userRole === "technician" && (
              <button className="icon-btn" onClick={handleServiceRequests} title="Service Requests">
                <MdOutlineWorkOutline className="header-icon" />
              </button>
            )}
            
            {userRole === "admin" && (
              <button className="icon-btn" onClick={handleDashboard} title="Admin Dashboard">
                <RiDashboardLine className="header-icon" />
              </button>
            )}
            
            <button className="icon-btn" onClick={handleNotifications} title="Notifications">
              <HiOutlineBell className="header-icon" />
            </button>
            <button className="icon-btn" onClick={handleMessages} title="Messages">
              <FiMessageSquare className="header-icon" />
            </button>
            <div className="user-info">
              <div className="user-avatar" onClick={handleProfile} title="Profile">
                <HiOutlineUser className="user-icon" />
              </div>
              <span className="user-name">{userName || userEmail.split('@')[0]}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <FiLogOut className="logout-icon" />
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