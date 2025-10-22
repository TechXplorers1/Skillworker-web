import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import { FaStar } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
// Image Imports
import plumberImg from '../assets/plumber.png';
import electricianImg from '../assets/electrician.png';
import acMechanicImg from '../assets/ac mechanic.png';
import carpenterImg from '../assets/carpenter.png';
import packersImg from '../assets/packers&movers.png';
import housecleanersImg from '../assets/House cleaners.png';
import camerafittingsImg from '../assets/camera fittings.png';
import privateinvestigatorsImg from '../assets/private investigators.png';
import welderImg from '../assets/welder.png';
import surveyorsImg from '../assets/surveyors.png';
import developersImg from '../assets/SoftwareDeveloper.png';
import bodymassageImg from '../assets/BodyMassage.png';
import constructioncleanersImg from '../assets/Construction cleaners.png';
import laundryImg from '../assets/laundry.png';
import deliveryImg from '../assets/delivery.png';
import { ref, onValue } from "firebase/database";
import { database } from '../firebase'; // Import the database instance

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

  useEffect(() => {
    // 1. Check local storage for the profile completion flag for ALL users
    const showPopupFlag = localStorage.getItem('showProfilePopup');
    
    if (showPopupFlag === 'true') {
      setShowProfilePopup(true);
    }
    
    // 2. CACHE CHECK: If data is already in cache, use it immediately
    if (serviceCache.length > 0) {
      setAllServices(serviceCache);
      setLoading(false);
      // We still return the cleanup function, but skip the initial fetch logic
      return () => {};
    }

    // 3. Fetch Services from Firebase Realtime Database (Only runs if cache is empty)
    const servicesRef = ref(database, 'services');
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const servicesData = snapshot.val();
      if (servicesData) {
        const fetchedServices = Object.keys(servicesData).map(key => {
          const service = servicesData[key];
          const serviceTitleLower = service.title ? service.title.toLowerCase() : '';
          
          // Use the local imported image if the title matches, otherwise use the image URL from DB
          const imageSource = serviceImageMap[serviceTitleLower] || service.image; 
          
          return {
            id: key,
            ...service,
            // Ensure the image source is the local asset if available
            image: imageSource, 
            link: serviceTitleLower.replace(/\s/g, '-')
          };
        });
        
        // 4. Update component state and the in-memory cache
        setAllServices(fetchedServices);
        serviceCache = fetchedServices; // Cache the data
      } else {
        setAllServices([]);
        serviceCache = [];
      }
      setLoading(false);
    });

    // Clean up the Firebase listener when the component unmounts
    return () => unsubscribe();
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

  // Pagination logic remains the same
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
          {/* Services Section with the loading spinner */}
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