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
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
    if (userData?.firstName) {
      return userData.firstName.charAt(0).toUpperCase();
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
    if (userData?.firstName) {
      return userData.firstName;
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
          <div className="tech-status-toggle">
            {/* <span className="toggle-label">Online</span> */}
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isTechnicianActive}
                onChange={handleToggleStatus}
              />
              <span className="slider round"></span>
            </label>
          </div>
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

            {/* Show Become a Technician for standard users */}
            {userData?.role === "user" && (
              <button className="icon-btn" onClick={handleBecomeTechnician}>
                <MdOutlineHandyman className="technician-icon" />
                Become a Technician
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