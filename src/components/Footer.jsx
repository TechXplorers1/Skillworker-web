import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUsers, FaStar } from "react-icons/fa";
import { MdHomeRepairService } from "react-icons/md";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

import "../styles/Footer.css";

const Footer = () => {
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
            <p><FaPhoneAlt /> +91 8855181212</p>
            <p><FaEnvelope /> support@skillworkers.com</p>
            <p><FaMapMarkerAlt /> India</p>
          </div>
        </div>

        {/* Middle Sections */}
        <div className="footer-links">
          <div>
            <h4>Our Services</h4>
            <ul>
              <li>Plumbing</li>
              <li>Electrical</li>
              <li>AC Repair</li>
              <li>Carpentry</li>
              <li>Moving</li>
              <li>Painting</li>
              <li className="quote-link">Get a Quote</li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>How It Works</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Blog</li>
              <li>Partnerships</li>
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
            <h4>Legal</h4>
            <ul>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© 2025 SkillWorkers. All rights reserved.</p>
        <p className="made-with">Made with ❤️ in India</p>
        <div className="social-icons">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaLinkedinIn /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
