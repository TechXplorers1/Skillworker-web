// ServiceTechniciansPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    FaArrowLeft,
    FaStar,
    FaCommentDots,
    FaClock,
    FaMapMarkerAlt,
    FaFilter
} from 'react-icons/fa';
import '../styles/ServiceTechniciansPage.css';

// Hero images (fixed references)
import plumberHeroImg from '../assets/plumber.png';
import electricianHeroImg from '../assets/electrician.png';
import acMechanicHeroImg from '../assets/ac mechanic.png';
import carpenterHeroImg from '../assets/carpenter.png';
import packersHeroImg from '../assets/packers&movers.png';
import housecleanersHeroImg from '../assets/House cleaners.png';
import camerafittingsHeroImg from '../assets/camera fittings.png';
import privateinvestigatorsHeroImg from '../assets/private investigators.png';
import welderHeroImg from '../assets/welder.png';
import surveyorsHeroImg from '../assets/surveyors.png';
import developersHeroImg from '../assets/SoftwareDeveloper.png';
import bodymassageHeroImg from '../assets/BodyMassage.png';
import constructioncleanersHeroImg from '../assets/Construction cleaners.png';
import laundryHeroImg from '../assets/laundry.png';
import deliveryHeroImg from '../assets/delivery.png';

// Technician data (placeholder examples)
const technicianData = {
    plumber: [
        { name: 'TECHY 1', rating: '4.8', reviews: '127', experience: '5+ years', distance: '2.3 km', available: true, image: '/profile1.png', price: 45 },
        { name: 'TECHY 2', rating: '4.9', reviews: '89', experience: '3+ years', distance: '1.8 km', available: true, image: '/profile2.png', price: 55 },
        { name: 'TECHY 3', rating: '4.7', reviews: '156', experience: '7+ years', distance: '3.1 km', available: false, image: '/profile3.png', price: 65 }
    ],
    electrician: [
        { name: 'ELECTRO 1', rating: '4.8', reviews: '102', experience: '6+ years', distance: '1.6 km', available: true, image: '/profile1.png', price: 50 },
        { name: 'ELECTRO 2', rating: '4.7', reviews: '85', experience: '4+ years', distance: '2.1 km', available: true, image: '/profile2.png', price: 60 }
    ],
    'ac-mechanic': [
        { name: 'COOLFIX 1', rating: '4.7', reviews: '75', experience: '5+ years', distance: '2.0 km', available: true, image: '/profile1.png', price: 70 }
    ],
    carpenter: [
        { name: 'WOODSMITH 1', rating: '4.9', reviews: '95', experience: '8+ years', distance: '2.0 km', available: true, image: '/profile1.png', price: 70 }
    ],
    'packers-movers': [
        { name: 'SHIFTIT 1', rating: '4.6', reviews: '60', experience: '4+ years', distance: '3.5 km', available: true, image: '/profile1.png', price: 80 }
    ],
    'house-cleaners': [
        { name: 'CLEANPRO 1', rating: '4.7', reviews: '88', experience: '3+ years', distance: '2.2 km', available: true, image: '/profile1.png', price: 45 }
    ],
    laundry: [
        { name: 'WASHME 1', rating: '4.5', reviews: '66', experience: '2+ years', distance: '1.9 km', available: true, image: '/profile1.png', price: 30 }
    ],
    'contruction-cleaners': [
        { name: 'POSTBUILD 1', rating: '4.8', reviews: '55', experience: '4+ years', distance: '3.1 km', available: true, image: '/profile1.png', price: 90 }
    ],
    surveyors: [
        { name: 'LANDCHECK 1', rating: '4.6', reviews: '48', experience: '6+ years', distance: '5.0 km', available: true, image: '/profile1.png', price: 120 }
    ],
    'camera-fittings': [
        { name: 'SECURECAM 1', rating: '4.9', reviews: '77', experience: '5+ years', distance: '2.7 km', available: true, image: '/profile1.png', price: 100 }
    ],
    developers: [
        { name: 'CODEPRO 1', rating: '4.9', reviews: '200', experience: '7+ years', distance: 'Remote', available: true, image: '/profile1.png', price: 50 }
    ],
    delivery: [
        { name: 'FASTDEL 1', rating: '4.7', reviews: '300', experience: '4+ years', distance: '1.0 km', available: true, image: '/profile1.png', price: 20 }
    ],
    welders: [
        { name: 'IRONFIX 1', rating: '4.5', reviews: '44', experience: '5+ years', distance: '2.8 km', available: true, image: '/profile1.png', price: 75 }
    ],
    'private-investigators': [
        { name: 'SLEUTH 1', rating: '4.8', reviews: '35', experience: '10+ years', distance: 'Varies', available: true, image: '/profile1.png', price: 150 }
    ],
    'body-massage': [
        { name: 'RELAXPRO 1', rating: '4.9', reviews: '120', experience: '6+ years', distance: '2.0 km', available: true, image: '/profile1.png', price: 60 }
    ]
};

// Hero banner data (fixed for all services)
const serviceHeroData = {
    plumber: {
        title: 'Plumber Services',
        description: 'Professional plumbing services for leak repairs, pipe fittings, installations, and maintenance.',
        image: plumberHeroImg
    },
    electrician: {
        title: 'Electrician Services',
        description: 'Expert electrical work including wiring, installations, repairs, and safety inspections.',
        image: electricianHeroImg
    },
    'ac-mechanic': {
        title: 'AC Mechanic Services',
        description: 'Air conditioning repair, installation, and maintenance by certified technicians.',
        image: acMechanicHeroImg
    },
    carpenter: {
        title: 'Carpenter Services',
        description: 'Custom carpentry, furniture repair, and installation services.',
        image: carpenterHeroImg
    },
    'packers-movers': {
        title: 'Packers & Movers Services',
        description: 'Reliable and efficient packing and moving services for home and office relocations.',
        image: packersHeroImg
    },
    'house-cleaners': {
        title: 'House Cleaners Services',
        description: 'Professional cleaning services for residential properties, including deep cleaning and routine maintenance.',
        image: housecleanersHeroImg
    },
    laundry: {
        title: 'Laundry Services',
        description: 'Expert laundry and dry-cleaning services with pick-up and delivery options.',
        image: laundryHeroImg
    },
    'contruction-cleaners': {
        title: 'Construction Cleaners Services',
        description: 'Post-construction cleaning services to prepare new or renovated buildings for occupancy.',
        image: constructioncleanersHeroImg
    },
    surveyors: {
        title: 'Surveyor Services',
        description: 'Precise land and property surveying services for various purposes.',
        image: surveyorsHeroImg
    },
    'camera-fittings': {
        title: 'Camera Fittings Services',
        description: 'Installation and maintenance of security cameras and surveillance systems.',
        image: camerafittingsHeroImg
    },
    developers: {
        title: 'Software Developers',
        description: 'Software and web development services for custom applications and websites.',
        image: developersHeroImg
    },
    delivery: {
        title: 'Delivery Services',
        description: 'Fast and reliable courier and delivery services for packages and documents.',
        image: deliveryHeroImg
    },
    welders: {
        title: 'Welding Services',
        description: 'Skilled welding services for metal fabrication, repair, and construction.',
        image: welderHeroImg
    },
    'private-investigators': {
        title: 'Private Investigator Services',
        description: 'Confidential and professional investigative services for personal and corporate needs.',
        image: privateinvestigatorsHeroImg
    },
    'body-massage': {
        title: 'Body Massage Services',
        description: 'Relaxing and therapeutic body massage services from certified professionals.',
        image: bodymassageHeroImg
    }
};

const ServiceTechniciansPage = () => {
    const { serviceName } = useParams();
    const navigate = useNavigate();

    const [selectedRating, setSelectedRating] = useState('All Ratings');
    const [selectedPrice, setSelectedPrice] = useState('All Prices');
    const [selectedAvailability, setSelectedAvailability] = useState('All Availability');
    const [filteredTechnicians, setFilteredTechnicians] = useState([]);

    const allTechnicians = technicianData[serviceName] || [];
    const heroData = serviceHeroData[serviceName];

    useEffect(() => {
        setFilteredTechnicians(allTechnicians);
    }, [serviceName]);

    const handleApplyFilters = () => {
        let newFilteredList = [...allTechnicians];

        if (selectedRating !== 'All Ratings') {
            const minRating = parseFloat(selectedRating.replace('+ Stars', ''));
            newFilteredList = newFilteredList.filter((tech) => parseFloat(tech.rating) >= minRating);
        }

        if (selectedPrice !== 'All Prices') {
            if (selectedPrice === '$20-50/hour') {
                newFilteredList = newFilteredList.filter((tech) => tech.price >= 20 && tech.price <= 50);
            } else if (selectedPrice === '$50-100/hour') {
                newFilteredList = newFilteredList.filter((tech) => tech.price >= 50 && tech.price <= 100);
            } else if (selectedPrice === '$100+/hour') {
                newFilteredList = newFilteredList.filter((tech) => tech.price >= 100);
            }
        }

        if (selectedAvailability !== 'All Availability') {
            if (selectedAvailability === 'Available Now' || selectedAvailability === 'Available Today') {
                newFilteredList = newFilteredList.filter((tech) => tech.available);
            }
        }

        setFilteredTechnicians(newFilteredList);
    };

    return (
        <div className="technicians-page-container">
            <Header />
            <main className="tech-main-content">
                {heroData && (
                    <section className="service-hero-banner" style={{ backgroundImage: `url(${heroData.image})` }}>
                        <div className="hero-overlay"></div>
                        <div className="hero-content">
                            <h1 className="banner-title">{heroData.title}</h1>
                            <p className="banner-description">{heroData.description}</p>
                        </div>
                    </section>
                )}

                <section className="filter-bar-container">
                    <div className="filter-bar">
                        <div className="filter-left">
                            <FaFilter className="filter-icon" />
                            <span className="filter-label">Filter by:</span>
                        </div>
                        <div className="filter-controls">
                            <select className="filter-select" value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
                                <option>All Ratings</option>
                                <option>4.5+ Stars</option>
                                <option>4.0+ Stars</option>
                            </select>
                            <select className="filter-select" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)}>
                                <option>All Prices</option>
                                <option>$20-50/hour</option>
                                <option>$50-100/hour</option>
                                <option>$100+/hour</option>
                            </select>
                            <select className="filter-select" value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)}>
                                <option>All Availability</option>
                                <option>Available Now</option>
                                <option>Available Today</option>
                            </select>
                            <button className="apply-filter-btn" onClick={handleApplyFilters}>Apply Filters</button>
                        </div>
                    </div>
                </section>

                <section className="technicians-section">
                    <div className="section-header">
                        <h2 className="section-title">Available Technicians ({filteredTechnicians.length})</h2>
                        <p className="section-subtitle">Choose from our verified professionals in your area</p>
                    </div>

                    {filteredTechnicians.length > 0 ? (
                        <div className="technicians-grid">
                            {filteredTechnicians.map((tech, i) => (
                                <div className="technician-card" key={i}>
                                    <div className="card-header">
                                        <div className="tech-info">
                                            <h3 className="tech-name">{tech.name}</h3>
                                            <div className="tech-rating">
                                                <FaStar className="star-icon" />
                                                <span>{tech.rating} ({tech.reviews} reviews)</span>
                                            </div>
                                            <div className="tech-details">
                                                <p><FaClock /> {tech.experience} experience</p>
                                                <p><FaMapMarkerAlt /> {tech.distance} away</p>
                                                <p className={`tech-status ${tech.available ? 'available' : 'busy'}`}>
                                                    {tech.available ? 'Available' : 'Busy'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="tech-price">
                                            ${tech.price}
                                            <br />
                                            per hour
                                        </div>
                                    </div>
                                    <div className="tech-actions">
                                        <button className="tech-contact-btn chat-btn" onClick={() => navigate('/login')}>
                                            <FaCommentDots /> Chat
                                        </button>
                                        <button className="tech-contact-btn book-btn" onClick={() => navigate('/login')}>
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results-message">
                            <p>Sorry, we couldn't find any technicians matching your filter criteria.</p>
                            <p>Please try adjusting your filters or check back later.</p>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ServiceTechniciansPage;