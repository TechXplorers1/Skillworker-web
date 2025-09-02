// src/pages/Homepage/Homepage.jsx
import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import { FaStar } from 'react-icons/fa';
import plumberImg from '../assets/plumber.png';
import electricianImg from '../assets/electrician.png';
import acMechanicImg from '../assets/ac mechanic.png';
import carpenterImg from '../assets/carpenter.png';
import packersImg from '../assets/packers&movers.png';

import '../styles/Homepage.css';

const services = [
  {
    title: 'Plumber',
    description: 'Professional plumbing services for leak repairs, pipe fittings, installations, and maintenance.',
    rating: '4.8',
    reviews: '152',
    image: plumberImg, // Replace with real image path
    link: '#plumber-technicians'
  },
  {
    title: 'Electrician',
    description: 'Expert electrical work including wiring, installations, repairs, and safety inspections.',
    rating: '4.9',
    reviews: '203',
    image: electricianImg,
    link: '#electrician-technicians'
  },
  {
    title: 'Ac Mechanic',
    description: 'Air conditioning repair, installation, and maintenance by certified technicians.',
    rating: '4.7',
    reviews: '98',
    image: acMechanicImg,
    link: '#ac-technicians'
  },
  {
    title: 'Carpenter',
    description: 'Quality carpentry services for furniture, custom woodwork, and home improvements.',
    rating: '4.8',
    reviews: '87',
    image: carpenterImg,
    link: '#carpenter-technicians'
  },
  {
    title: 'Packers And Movers',
    description: 'Professional moving services with careful packing and safe transportation.',
    rating: '4.6',
    reviews: '134',
    image: packersImg,
    link: '#movers-technicians'
  }
];

const Homepage = () => {
  return (
    <div className="homepage">
      <Header />
      <HeroSection />

      <main>
        {/* Services Section */}
        <section className="services">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-image">
                  <img src={service.image} alt={service.title} />
                  <h3>{service.title}</h3>
                </div>
                <div className="service-content">
                  <p>{service.description}</p>
                  <div className="rating">
                    <FaStar className="star-icon" />
                    <span>{service.rating} ({service.reviews} reviews)</span>
                  </div>
                  <div className="status">Available</div>
                  <a href={service.link} className="btn">View Technicians</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="why-choose">
          <div className="why-container">
            <h2 className="why-title">Why Choose SkillWorkers?</h2>
            <p className="why-subtitle">Connecting you with skilled professionals</p>

            <div className="why-features">
              <div className="why-card">
                <div className="icon-container blue"><FaStar /></div>
                <h3>Verified Professionals</h3>
                <p>All technicians are background-checked and verified for your safety</p>
              </div>

              <div className="why-card">
                <div className="icon-container green"><FaStar /></div>
                <h3>24/7 Availability</h3>
                <p>Emergency services available around the clock when you need them</p>
              </div>

              <div className="why-card">
                <div className="icon-container purple"><FaStar /></div>
                <h3>Transparent Pricing</h3>
                <p>No hidden fees. Get upfront pricing before work begins</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;
