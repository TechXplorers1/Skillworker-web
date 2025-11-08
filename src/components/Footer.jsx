import React, { useState, useEffect } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUsers, FaStar } from "react-icons/fa";
import { MdHomeRepairService } from "react-icons/md";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase"; // Assuming firebase is exported correctly

import "../styles/Footer.css";

const Footer = () => {
  const [settings, setSettings] = useState({
    supportEmail: "support@skillworkers.com", // Default fallback
    supportPhone: "+91 8855181212",           // Default fallback
    facebookUrl: "#",
    instagramUrl: "#",
    twitterUrl: "#",
  });

  useEffect(() => {
    const settingsRef = ref(database, "contact_settings");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const settingsData = snapshot.val();
      if (settingsData) {
        setSettings({
          supportEmail: settingsData.support_email || "support@skillworkers.com",
          supportPhone: settingsData.support_phone || "+91 8855181212",
          facebookUrl: settingsData.facebook_url || "#",
          instagramUrl: settingsData.instagram_url || "#",
          twitterUrl: settingsData.twitter_url || "#",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to check if a URL is valid/set before rendering a link
  const isLinkValid = (url) => url && url !== "#" && url.startsWith('http');

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Section - Logo & Info */}
        <div className="footer-left">
          <div className="footer-logo">
            <MdHomeRepairService className="logo-icon" />
            <span className="logo-text">SkillWorkers</span>
          </div>
          <p className="footer-desc">
            Connecting you with skilled professionals for all your home service needs. Trusted,
            reliable, and affordable solutions at your fingertips.
          </p>
          <div className="footer-contact">
            {/* Displaying Live Phone Number */}
            <p>
              <FaPhoneAlt /> 
              <a href={`tel:${settings.supportPhone}`} className="contact-link">{settings.supportPhone}</a>
            </p>
            {/* Displaying Live Email */}
            <p>
              <FaEnvelope /> 
              <a href={`mailto:${settings.supportEmail}`} className="contact-link">{settings.supportEmail}</a>
            </p>
            <p><FaMapMarkerAlt /> India</p>
          </div>
        </div>

        {/* Middle Sections */}
        <div className="footer-links">
          <div>
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>How It Works</li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Contact Support</li>
              <li>Safety</li>
              <li>Trust & Safety</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© 2025 SkillWorkers. All rights reserved.</p>
        <div className="social-icons">
          {/* Displaying Live Social Media Links */}
          {isLinkValid(settings.facebookUrl) && (
            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          )}
          {isLinkValid(settings.twitterUrl) && (
            <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          )}
          {isLinkValid(settings.instagramUrl) && (
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          )}
          {/* LinkedinIn kept as a static placeholder since it's not in settings */}
          <a href="#"><FaLinkedinIn /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;