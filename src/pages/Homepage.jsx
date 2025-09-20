import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ref, onValue } from "firebase/database";
import { database } from '../firebase'; // Import the database instance

import '../styles/Homepage.css';

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const servicesRef = ref(database, 'services');
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const servicesData = snapshot.val();
      if (servicesData) {
        const fetchedServices = Object.keys(servicesData).map(key => ({
          id: key,
          ...servicesData[key],
          link: servicesData[key].title.toLowerCase().replace(/\s/g, '-')
        }));
        setAllServices(fetchedServices);
      } else {
        setAllServices([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredServices = allServices.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedServices = activeTab === '1' ? filteredServices.slice(0, 9) : filteredServices.slice(9, 15);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="homepage">
        <Header />
        <main>
          <HeroSection setSearchQuery={setSearchQuery} />
          <section className="services">
            <h2 className="section-title">Loading Services...</h2>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="homepage">
      <Header />
      <main>
        <HeroSection setSearchQuery={setSearchQuery} />
        {/* Services Section */}
        <section className="services">
          <h2 className="section-title">Explore our Services</h2>
          
          <div className="services-grid">
            {displayedServices.length > 0 ? (
              displayedServices.map((service) => (
                <div className="service-card" key={service.id}>
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="card-image"
                    />
                  ) : (
                    <div className="card-image-placeholder">
                      <p>Image Not Available</p>
                    </div>
                  )}
                  <div className="card-content">
                    <h3 className="card-title">{service.title}</h3>
                    <p className="card-description">{service.description}</p>
                    <div className="card-info"></div>
                    <Link to={`/services/${service.link}`} className="btn">View Technicians</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results-found">
                <p>No results found for your search.</p>
              </div>
            )}
          </div>
          
          {allServices.length > 9 && (
            <div className="radio-input-container">
              <div className="radio-input">
                <label>
                  <input 
                    type="radio" 
                    id="tab-1" 
                    name="service-tabs" 
                    value="1" 
                    checked={activeTab === '1'} 
                    onChange={() => handleTabChange('1')} 
                  />
                  <span>1</span>
                </label>
                <label>
                  <input 
                    type="radio" 
                    id="tab-2" 
                    name="service-tabs" 
                    value="2" 
                    checked={activeTab === '2'} 
                    onChange={() => handleTabChange('2')} 
                  />
                  <span>2</span>
                </label>
                <span className="selection" />
              </div>
            </div>
          )}
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