import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import { FaStar } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
// Image Imports
import plumberImg from '../assets/plumber.jpeg';
import electricianImg from '../assets/electrician.jpeg';
import acMechanicImg from '../assets/ac_mechanic.jpeg';
import carpenterImg from '../assets/carpenter.jpeg';
import packersImg from '../assets/packers_movers.jpeg';
import housecleanersImg from '../assets/house_cleaners.jpeg';
import camerafittingsImg from '../assets/cam_fitting.jpeg';
import privateinvestigatorsImg from '../assets/private_investigators.jpeg';
import welderImg from '../assets/welders.jpeg';
import surveyorsImg from '../assets/surveyors.jpeg';
import developersImg from '../assets/software_dev.jpeg';
import bodymassageImg from '../assets/body_massage.jpeg';
import constructioncleanersImg from '../assets/Construction.jpeg';
import laundryImg from '../assets/laundry.jpeg';
import deliveryImg from '../assets/delivery.jpeg';

// Add these imports!
import { ref, get, query, orderByKey, limitToFirst, startAfter } from "firebase/database";
import { database } from "../firebase"; // Adjust this path to where your firebase config file is located

import '../styles/Homepage.css';

// --- IN-MEMORY CACHE ---
// This variable will store the fetched data so it's only loaded once per session.
let serviceCache = [];

// Map service titles to their imported images (All keys MUST be lowercase for lookup)
const serviceImageMap = {
  'plumber': plumberImg,
  'electrician': electricianImg,
  'ac mechanic': acMechanicImg,
  'carpenter': carpenterImg,
  'packers & movers': packersImg,
  'house cleaners': housecleanersImg,
  'laundry': laundryImg,
  'construction cleaners': constructioncleanersImg,
  'surveyors': surveyorsImg,
  'camera fiitings': camerafittingsImg,
  'developers': developersImg,
  'delivery': deliveryImg,
  'welders': welderImg,
  'private investigators': privateinvestigatorsImg,
  'body massage': bodymassageImg,
};

const Homepage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [lastKey, setLastKey] = useState(null); // Cursor for pagination

  // Helper to process and format service data
  const processServiceData = (data) => {
    return Object.keys(data).map(key => {
      const service = data[key];
      const serviceTitleLower = service.title ? service.title.toLowerCase() : '';
      const imageSource = serviceImageMap[serviceTitleLower] || service.image;
      return {
        id: key,
        ...service,
        image: imageSource,
        link: serviceTitleLower.replace(/\s/g, '-')
      };
    });
  };

  const fetchServices = async (isInitial = true) => {
    setLoading(true);
    try {
      let servicesQuery;
      const servicesRef = ref(database, 'services');

      if (isInitial) {
        // Fetch first 9 for Tab 1
        servicesQuery = query(servicesRef, limitToFirst(9));
      } else {
        // Fetch next 6 for Tab 2, starting after the last key we have
        if (!lastKey) {
          setLoading(false);
          return;
        }
        servicesQuery = query(servicesRef, startAfter(lastKey), limitToFirst(6));
      }

      const snapshot = await get(servicesQuery);
      const servicesData = snapshot.val();

      if (servicesData) {
        const fetchedServices = processServiceData(servicesData);

        // Update lastKey for next pagination
        const keys = Object.keys(servicesData);
        if (keys.length > 0) {
          setLastKey(keys[keys.length - 1]);
        }

        if (isInitial) {
          setAllServices(fetchedServices);
          serviceCache = fetchedServices;
        } else {
          const updatedServices = [...allServices, ...fetchedServices];
          setAllServices(updatedServices);
          serviceCache = updatedServices;
        }
      } else if (isInitial) {
        setAllServices([]);
        serviceCache = [];
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Profile Popup Check
    const showPopupFlag = localStorage.getItem('showProfilePopup');
    if (showPopupFlag === 'true') {
      setShowProfilePopup(true);
    }

    // 2. Data Fetching Strategy
    if (serviceCache.length > 0) {
      setAllServices(serviceCache);
      setLoading(false);
      // We also need to recover the lastKey from the cache if we want to fetch more later
      // The cursor is the ID of the last item in the cache
      if (serviceCache.length > 0) {
        setLastKey(serviceCache[serviceCache.length - 1].id);
      }
    } else {
      fetchServices(true); // Initial fetch for Tab 1
    }
  }, []);

  const handlePopupAction = (action) => {
    setShowProfilePopup(false);
    localStorage.removeItem('showProfilePopup');

    if (action === 'completeNow') {
      navigate('/profile');
    }
  };

  // Filter services based on search query
  const filteredServices = allServices.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  // Tab 1: 0-9
  // Tab 2: 9-15
  const displayedServices = activeTab === '1' ? filteredServices.slice(0, 9) : filteredServices.slice(9, 15);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If switching to Tab 2 and we haven't fetched enough data yet, fetch more
    if (tabValue === '2' && allServices.length <= 9) {
      fetchServices(false);
    }
  };

  if (loading && allServices.length === 0) {
    return (
      <div className="homepage">
        <Header />
        <main>
          <HeroSection setSearchQuery={setSearchQuery} />
          <section className="services">
            <h2 className="section-title">Loading Services...</h2>
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
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

        {/* Profile Completion Popup for ALL Users */}
        {showProfilePopup && (
          <div className="modal-backdrop">
            <div className="modal-content homepage-popup">
              <p className="modal-text">
                {localStorage.getItem("userRole") === "technician"
                  ? "👋 Welcome! Please fill up your details to deliver services."
                  : "👋 Welcome! Please complete your profile with address details to book services."
                }
              </p>
              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={() => handlePopupAction('completeNow')}
                >
                  Complete Now
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handlePopupAction('later')}
                >
                  I'll do it later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services Section */}
        <section className="services fade-in-up">
          <h2 className="section-title">Explore our Services</h2>

          <div className="services-grid">
            {displayedServices.length > 0 ? (
              displayedServices.map((service, index) => (
                // The main container for the 3D effect
                <div className="service-card-flipper" key={service.id || index}>

                  {/* UPDATED: This is the "inside" of the book, with a background image */}
                  <div
                    className="card-back"
                    style={{ backgroundImage: `url(${service.image})` }}
                  >
                    {/* This overlay creates the shaded/masked effect */}
                    <div className="card-back-overlay">
                      <h3 className="card-title">{service.title}</h3>
                      <p>Ready to find a professional?</p>
                      <Link to={`/services/${service.link}`} className="btn">View Technicians</Link>
                    </div>
                  </div>

                  {/* This is the "cover" of the book that flips */}
                  <div className="card-cover">
                    <div className="card-image-container">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.title}
                          className="card-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <div className="card-image-placeholder">
                          <p>Image Not Available</p>
                        </div>
                      )}
                      <div className="image-mask"></div>
                    </div>

                    <div className="card-content">
                      <h3 className="card-title">{service.title}</h3>
                      <p className="card-description">{service.description}</p>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="no-results-found">
                {searchQuery ? (
                  <p>No results found for "{searchQuery}".</p>
                ) : (
                  <p>No services available. Please try reloading.</p>
                )}
              </div>
            )}
          </div>


          {allServices.length > 0 && (
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
        <section className="why-choose fade-in-up" style={{ animationDelay: '0.2s' }}>
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