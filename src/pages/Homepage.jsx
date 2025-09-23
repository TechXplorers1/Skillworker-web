import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
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

const services = [
  {
    title: 'Plumber',
    description: 'Professional plumbing services for leak repairs, pipe fittings, installations, and maintenance.',
    image: plumberImg,
    link: 'plumber'
  },
  {
    title: 'Electrician',
    description: 'Expert electrical work including wiring, installations, repairs, and safety inspections.',
    image: electricianImg,
    link: 'electrician'
  },
  {
    title: 'Ac Mechanic',
    description: 'Air conditioning repair, installation, and maintenance by certified technicians.',
    image: acMechanicImg,
    link: 'ac-mechanic'
  },
  {
    title: 'Carpenter',
    description: 'Custom carpentry, furniture repair, and installation services.',
    image: carpenterImg,
    link: 'carpenter'
  },
  {
    title: 'Packers & Movers',
    description: 'Reliable and efficient packing and moving services for home and office relocations.',
    image: packersImg,
    link: 'packers-movers'
  },
  {
    title: 'House cleaners',
    description: 'Professional cleaning services for residential properties, including deep cleaning and routine maintenance.',
    image: housecleanersImg,
    link: 'house-cleaners'
  },
  {
    title: 'laundry',
    description: 'Expert laundry and dry-cleaning services with pick-up and delivery options.',
    image: laundryImg,
    link: 'laundry'
  },
  {
    title: 'Construction cleaners',
    description: 'Post-construction cleaning services to prepare new or renovated buildings for occupancy.',
    image: constructioncleanersImg,
    link: 'contruction-cleaners'
  },
  {
    title: 'surveyors',
    description: 'Precise land and property surveying services for various purposes.',
    image: surveyorsImg,
    link: 'surveyors'
  },
  {
    title: 'camera fiitings',
    description: 'Installation and maintenance of security cameras and surveillance systems.',
    image: camerafittingsImg,
    link: 'camera-fittings'
  },
  {
    title: 'developers',
    description: 'Software and web development services for custom applications and websites.',
    image: developersImg,
    link: 'developers'
  },
  {
    title: 'delivery',
    description: 'Fast and reliable courier and delivery services for packages and documents.',
    image: deliveryImg,
    link: 'delivery'
  },
  {
    title: 'welders',
    description: 'Skilled welding services for metal fabrication, repair, and construction.',
    image: welderImg,
    link: 'welders'
  },
  {
    title: 'private investigators',
    description: 'Confidential and professional investigative services for personal and corporate needs.',
    image: privateinvestigatorsImg,
    link: 'private-investigators'
  },
  {
    title: 'Body Massage',
    description: 'Relaxing and therapeutic body massage services from certified professionals.',
    image: bodymassageImg,
    link: 'body-massage'
  },
];

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This part is for Firebase, keeping it as is
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

  const combinedServices = [...services, ...allServices];

  const filteredServices = combinedServices.filter(service =>
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
              displayedServices.map((service, index) => (
                <div className="service-card" key={service.id || index}>
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
                    <div className="card-info">
                    </div>
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
          
          {combinedServices.length > 9 && (
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