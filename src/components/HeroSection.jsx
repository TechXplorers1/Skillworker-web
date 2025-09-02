import React from "react";
import { FaSearch } from "react-icons/fa";
import "../styles/HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">SkillWorkers</h1>
        <p className="hero-subtitle">
          Connect with skilled professionals in your area for all your home
          service needs
        </p>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="What service do you need?"
            className="search-input"
          />
          <button className="search-btn">Search</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
