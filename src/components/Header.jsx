import React, { useState, useEffect } from "react";
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
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, update, onValue } from "firebase/database";
import { auth, database } from "../firebase";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isTechnicianActive, setIsTechnicianActive] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        const userRef = ref(database, 'users/' + firebaseUser.uid);

        const unsubscribeDB = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData(data);
            if (data.role === 'technician') {
              setIsTechnicianActive(data.isActive || false);
            }
          } else {
            setUserData({
              fullName: firebaseUser.displayName || firebaseUser.email,
              email: firebaseUser.email,
              role: "user"
            });
          }
        });
        return () => unsubscribeDB();
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    try {
      if (userData?.role === 'technician' && user) {
        const userRef = ref(database, `users/${user.uid}`);
        await update(userRef, { isActive: false });
      }
      await signOut(auth);
      // Clear local storage on logout
      localStorage.removeItem("userRole");
      localStorage.removeItem("isLoggedIn");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const handleMessages = () => {
    navigate("/message-box");
  };

  const handleBookings = () => {
    navigate("/my-bookings");
  };

  const handleServiceRequests = () => {
    navigate("/service-requests");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleToggleStatus = async () => {
    const newStatus = !isTechnicianActive;
    if (user) {
      try {
        const userRef = ref(database, `users/${user.uid}`);
        await update(userRef, { isActive: newStatus });
        setIsTechnicianActive(newStatus);
      } catch (error) {
        console.error("Failed to update technician status:", error);
      }
    }
  };
  
  const getAvatarLetter = () => {
    if (userData?.fullName) {
      return userData.fullName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };
  
  const getUserDisplayName = () => {
    if (userData?.fullName) {
      return userData.fullName;
    }
    if (user?.email) {
        return user.email.split('@')[0];
    }
    return "User";
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

      {user && userData?.role === "technician" && (
        <div className="header-center">
           {/* --- NEW CYBER TOGGLE SWITCH --- */}
          <div className="cyber-toggle-wrapper">
            <input className="cyber-toggle-checkbox" id="cyber-toggle" type="checkbox" checked={isTechnicianActive} onChange={handleToggleStatus} />
            <label className="cyber-toggle" htmlFor="cyber-toggle">
              <div className="cyber-toggle-track">
                <div className="cyber-toggle-track-glow" />
                <div className="cyber-toggle-track-dots">
                  <span className="cyber-toggle-track-dot" />
                  <span className="cyber-toggle-track-dot" />
                  <span className="cyber-toggle-track-dot" />
                </div>
              </div>
              <div className="cyber-toggle-thumb">
                <div className="cyber-toggle-thumb-shadow" />
                <div className="cyber-toggle-thumb-highlight" />
                <div className="cyber-toggle-thumb-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-2.48-2.02-4.5-4.5-4.5s-4.5 2.02-4.5 4.5 2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5zm-4.5 7.5c-4.14 0-7.5-3.36-7.5-7.5s3.36-7.5 7.5-7.5 7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5zm0-16.5c-4.97 0-9 4.03-9 9h-3l3.89 3.89.07.14 4.04-4.03h-3c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42c1.63 1.63 3.87 2.64 6.36 2.64 4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
                  </svg>
                </div>
              </div>
              <div className="cyber-toggle-particles">
                <span className="cyber-toggle-particle" />
                <span className="cyber-toggle-particle" />
                <span className="cyber-toggle-particle" />
                <span className="cyber-toggle-particle" />
              </div>
            </label>
            <div className="cyber-toggle-labels">
              <span className="cyber-toggle-label-off">OFF</span>
              <span className="cyber-toggle-label-on">ON</span>
            </div>
          </div>
           {/* --- END OF CYBER TOGGLE SWITCH --- */}
        </div>
      )}

      <div className="header-right">
        {user ? (
          <div className="user-menu">
            
            {/* Show My Bookings for all logged-in users */}
            {userData?.role && (
              <button className="icon-btn" onClick={handleBookings} title="My Bookings">
                <RiCalendarEventLine className="header-icon" />
                <span className="icon-label">Bookings</span>
              </button>
            )}

            {/* Show Service Requests for technicians */}
            {userData?.role === "technician" && (
              <>
                <button className="icon-btn" onClick={handleServiceRequests} title="Service Requests">
                  <MdOutlineWorkOutline className="header-icon" />
                  <span className="icon-label">Service Requests</span>
                </button>
              </>
            )}

            {/* Show Admin Dashboard for admins */}
            {userData?.role === "admin" && (
              <button className="icon-btn" onClick={handleDashboard} title="Admin Dashboard">
                <RiDashboardLine className="header-icon" />
                <span className="icon-label">Dashboard</span>
              </button>
            )}

            <button className="icon-btn" onClick={handleNotifications} title="Notifications">
              <HiOutlineBell className="header-icon" />
              <span className="icon-label">Notifications</span>
            </button>

            <button className="icon-btn" onClick={handleMessages} title="Messages">
              <FiMessageSquare className="header-icon" />
              <span className="icon-label">Messages</span>
            </button>

            <div className="user-info">
              <div className="user-avatar" onClick={handleProfile} title="Profile">
                <span className="avatar-letter">{getAvatarLetter()}</span>
              </div>
              <span className="user-name">{getUserDisplayName()}</span>
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

