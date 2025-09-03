import React, { useState } from 'react';
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

import '../styles/Homepage.css';

const services = [
  {
    title: 'Plumber',
    description: 'Professional plumbing services for leak repairs, pipe fittings, installations, and maintenance.',
    rating: '4.8',
    reviews: '152',
    image: plumberImg,
    link: 'plumber'
  },
  {
    title: 'Electrician',
    description: 'Expert electrical work including wiring, installations, repairs, and safety inspections.',
    rating: '4.9',
    reviews: '203',
    image: electricianImg,
    link: 'electrician'
  },
  {
    title: 'Ac Mechanic',
    description: 'Air conditioning repair, installation, and maintenance by certified technicians.',
    rating: '4.7',
    reviews: '98',
    image: acMechanicImg,
    link: 'ac-mechanic'
  },
  {
    title: 'Carpenter',
    description: 'Custom carpentry, furniture repair, and installation services.',
    rating: '4.5',
    reviews: '120',
    image: carpenterImg,
    link: 'carpenter'
  },
  {
    title: 'Packers & Movers',
    description: 'Reliable and efficient packing and moving services for home and office relocations.',
    rating: '4.6',
    reviews: '85',
    image: packersImg,
    link: 'packers-movers'
  },
  {
    title: 'House cleaners',
    description: 'Professional cleaning services for residential properties, including deep cleaning and routine maintenance.',
    rating: '4.7',
    reviews: '130',
    image: housecleanersImg,
    link: 'house-cleaners'
  },
  {
    title: 'laundry',
    description: 'Expert laundry and dry-cleaning services with pick-up and delivery options.',
    rating: '4.5',
    reviews: '90',
    image: laundryImg,
    link: 'laundry'
  },
  {
    title: 'Construction cleaners',
    description: 'Post-construction cleaning services to prepare new or renovated buildings for occupancy.',
    rating: '4.8',
    reviews: '75',
    image: constructioncleanersImg,
    link: 'contruction-cleaners'
  },
  {
    title: 'surveyors',
    description: 'Precise land and property surveying services for various purposes.',
    rating: '4.6',
    reviews: '60',
    image: surveyorsImg,
    link: 'surveyors'
  },
  {
    title: 'camera fiitings',
    description: 'Installation and maintenance of security cameras and surveillance systems.',
    rating: '4.9',
    reviews: '110',
    image: camerafittingsImg,
    link: 'camera-fittings'
  },
  {
    title: 'developers',
    description: 'Software and web development services for custom applications and websites.',
    rating: '4.9',
    reviews: '250',
    image: developersImg,
    link: 'developers'
  },
  {
    title: 'delivery',
    description: 'Fast and reliable courier and delivery services for packages and documents.',
    rating: '4.7',
    reviews: '300',
    image: deliveryImg,
    link: 'delivery'
  },
  {
    title: 'welders',
    description: 'Skilled welding services for metal fabrication, repair, and construction.',
    rating: '4.5',
    reviews: '55',
    image: welderImg,
    link: 'welders'
  },
  {
    title: 'private investigators',
    description: 'Confidential and professional investigative services for personal and corporate needs.',
    rating: '4.8',
    reviews: '40',
    image: privateinvestigatorsImg,
    link: 'private-investigators'
  },
  {
    title: 'Body Massage',
    description: 'Relaxing and therapeutic body massage services from certified professionals.',
    rating: '4.9',
    reviews: '200',
    image: bodymassageImg,
    link: 'body-massage'
  },
];

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="homepage">
      <Header />
      <main>
        <HeroSection setSearchQuery={setSearchQuery} />
        {/* Services Section */}
        <section className="services">
          <h2 className="section-title">Explore our Services</h2>
          <div className="services-grid">
            {filteredServices.map((service, index) => (
              <div className="service-card" key={index}>
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="card-image"
                  />
                ) : (
                  <div className="card-image-placeholder">
                    {/* Your image here */}
                  </div>
                )}
                <div className="card-content">
                  <h3 className="card-title">{service.title}</h3>
                  <p className="card-description">{service.description}</p>
                  <div className="card-info">
                    <div className="rating">
                      <FaStar className="star-icon" />
                      <span>{service.rating} ({service.reviews})</span>
                    </div>
                    <div className="status">Available</div>
                  </div>
                  <Link to={`/services/${service.link}`} className="btn">View Technicians</Link>
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
