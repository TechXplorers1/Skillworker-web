import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
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
        { id: 'tech1', name: 'TECHY 1', rating: '4.8', reviews: '127', experience: '5+ years', distance: '2.3 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 45 }, service: 'Plumber' },
        { id: 'tech2', name: 'TECHY 2', rating: '4.9', reviews: '89', experience: '3+ years', distance: '1.8 km', available: true, image: '/profile2.png', price: { type: 'hourly', amount: 55 }, service: 'Plumber' },
        { id: 'tech3', name: 'TECHY 3', rating: '4.7', reviews: '156', experience: '7+ years', distance: '3.1 km', available: false, image: '/profile3.png', price: { type: 'dayly', amount: 350 }, service: 'Plumber' }
    ],
    electrician: [
        { id: 'electro1', name: 'ELECTRO 1', rating: '4.8', reviews: '102', experience: '6+ years', distance: '1.6 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 50 }, service: 'Electrician' },
        { id: 'electro2', name: 'ELECTRO 2', rating: '4.7', reviews: '85', experience: '4+ years', distance: '2.1 km', available: true, image: '/profile2.png', price: { type: 'dayly', amount: 450 }, service: 'Electrician' }
    ],
    'ac-mechanic': [
        { id: 'coolfix1', name: 'COOLFIX 1', rating: '4.7', reviews: '75', experience: '5+ years', distance: '2.0 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 70 }, service: 'AC Mechanic' }
    ],
    carpenter: [
        { id: 'woodsmith1', name: 'WOODSMITH 1', rating: '4.9', reviews: '95', experience: '8+ years', distance: '2.0 km', available: true, image: '/profile1.png', price: { type: 'dayly', amount: 400 }, service: 'Carpenter' }
    ],
    'packers-movers': [
        { id: 'shiftit1', name: 'SHIFTIT 1', rating: '4.6', reviews: '60', experience: '4+ years', distance: '3.5 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 80 }, service: 'Packers & Movers' }
    ],
    'house-cleaners': [
        { id: 'cleanpro1', name: 'CLEANPRO 1', rating: '4.7', reviews: '88', experience: '3+ years', distance: '2.2 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 45 }, service: 'House Cleaners' }
    ],
    laundry: [
        { id: 'washme1', name: 'WASHME 1', rating: '4.5', reviews: '66', experience: '2+ years', distance: '1.9 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 30 }, service: 'Laundry' }
    ],
    'contruction-cleaners': [
        { id: 'postbuild1', name: 'POSTBUILD 1', rating: '4.8', reviews: '55', experience: '4+ years', distance: '3.1 km', available: true, image: '/profile1.png', price: { type: 'dayly', amount: 500 }, service: 'Construction Cleaners' }
    ],
    surveyors: [
        { id: 'landcheck1', name: 'LANDCHECK 1', rating: '4.6', reviews: '48', experience: '6+ years', distance: '5.0 km', available: true, image: '/profile1.png', price: { type: 'dayly', amount: 600 }, service: 'Surveyors' }
    ],
    'camera-fittings': [
        { id: 'securecam1', name: 'SECURECAM 1', rating: '4.9', reviews: '77', experience: '5+ years', distance: '2.7 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 100 }, service: 'Camera Fittings' }
    ],
    developers: [
        { id: 'codepro1', name: 'CODEPRO 1', rating: '4.9', reviews: '200', experience: '7+ years', distance: 'Remote', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 50 }, service: 'Software Developer' }
    ],
    delivery: [
        { id: 'fastdel1', name: 'FASTDEL 1', rating: '4.7', reviews: '300', experience: '4+ years', distance: '1.0 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 20 }, service: 'Delivery' }
    ],
    welders: [
        { id: 'ironfix1', name: 'IRONFIX 1', rating: '4.5', reviews: '44', experience: '5+ years', distance: '2.8 km', available: true, image: '/profile1.png', price: { type: 'dayly', amount: 380 }, service: 'Welder' }
    ],
    'private-investigators': [
        { id: 'sleuth1', name: 'SLEUTH 1', rating: '4.8', reviews: '35', experience: '10+ years', distance: 'Varies', available: true, image: '/profile1.png', price: { type: 'dayly', amount: 750 }, service: 'Private Investigator' }
    ],
    'body-massage': [
        { id: 'relaxpro1', name: 'RELAXPRO 1', rating: '4.9', reviews: '120', experience: '6+ years', distance: '2.0 km', available: true, image: '/profile1.png', price: { type: 'hourly', amount: 60 }, service: 'Body Massage' }
    ]
};

// Hero banner data
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
    const [selectedHourlyPrice, setSelectedHourlyPrice] = useState('All');
    const [selecteddaylyPrice, setSelecteddaylyPrice] = useState('All');
    const [selectedAvailability, setSelectedAvailability] = useState('All Availability');
    const [filteredTechnicians, setFilteredTechnicians] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);

    const allTechnicians = technicianData[serviceName] || [];
    const heroData = serviceHeroData[serviceName];

    useEffect(() => {
        setFilteredTechnicians(allTechnicians);
    }, [serviceName]);

    const handleApplyFilters = () => {
        let newFilteredList = [...allTechnicians];

        // Filter by rating
        if (selectedRating !== 'All Ratings') {
            const minRating = parseFloat(selectedRating.replace('+ Stars', ''));
            newFilteredList = newFilteredList.filter((tech) => parseFloat(tech.rating) >= minRating);
        }

        // Filter by hourly price
        if (selectedHourlyPrice !== 'All') {
            const hourlyPriceRange = selectedHourlyPrice.split('-');
            const minPrice = parseInt(hourlyPriceRange[0].replace('₹', ''), 10);
            const maxPrice = hourlyPriceRange[1] ? parseInt(hourlyPriceRange[1].replace('₹/hour', ''), 10) : Infinity;

            newFilteredList = newFilteredList.filter((tech) =>
                tech.price.type === 'hourly' && tech.price.amount >= minPrice && tech.price.amount <= maxPrice
            );
        }

        // Filter by dayly price
        if (selecteddaylyPrice !== 'All') {
            const daylyPriceRange = selecteddaylyPrice.split('-');
            const minPrice = parseInt(daylyPriceRange[0].replace('₹', ''), 10);
            const maxPrice = daylyPriceRange[1] ? parseInt(daylyPriceRange[1].replace('₹/day', ''), 10) : Infinity;

            newFilteredList = newFilteredList.filter((tech) =>
                tech.price.type === 'dayly' && tech.price.amount >= minPrice && tech.price.amount <= maxPrice
            );
        }
        
        if (selecteddaylyPrice !== 'All' && selectedHourlyPrice === 'All') {
          newFilteredList = newFilteredList.filter((tech) => tech.price.type === 'dayly');
        }
        if (selectedHourlyPrice !== 'All' && selecteddaylyPrice === 'All') {
          newFilteredList = newFilteredList.filter((tech) => tech.price.type === 'hourly');
        }

        if (selectedAvailability !== 'All Availability') {
            if (selectedAvailability === 'Available Now' || selectedAvailability === 'Available Today') {
                newFilteredList = newFilteredList.filter((tech) => tech.available);
            }
        }

        setFilteredTechnicians(newFilteredList);
    };

    const handleChatClick = (technicianId) => {
        setSelectedTechnicianId(technicianId);
        setShowPopup(true);
    };

    const handleBookClick = (technician) => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        // Store technician data in session storage
        sessionStorage.setItem('selectedTechnician', JSON.stringify(technician));

        if (isLoggedIn) {
            navigate(`/booking/${serviceName}/${technician.id}`);
        } else {
            localStorage.setItem("redirectAfterLogin", `/booking/${serviceName}/${technician.id}`);
            navigate("/login");
        }
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
                            <select className="filter-select" value={selectedHourlyPrice} onChange={(e) => { setSelectedHourlyPrice(e.target.value); setSelecteddaylyPrice('All'); }}>
                                <option>Hourly prices</option>
                                <option>₹20-50/hour</option>
                                <option>₹50-100/hour</option>
                                <option>₹100+/hour</option>
                            </select>
                            <select className="filter-select" value={selecteddaylyPrice} onChange={(e) => { setSelecteddaylyPrice(e.target.value); setSelectedHourlyPrice('All'); }}>
                                <option>Day prices</option>
                                <option>₹200-400/day</option>
                                <option>₹400-600/day</option>
                                <option>₹600+/day</option>
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
                                        <img src={tech.image} alt={tech.name} className="tech-image" />
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
                                            ₹{tech.price.amount}
                                            <br />
                                            per {tech.price.type === 'hourly' ? 'hour' : 'day'}
                                        </div>
                                    </div>
                                    <div className="tech-actions">
                                        <button className="tech-contact-btn chat-btn" onClick={() => handleChatClick(tech.id)}>
                                            <FaCommentDots /> Chat
                                        </button>
                                        <button className="tech-contact-btn book-btn" onClick={() => handleBookClick(tech)}>
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

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-card">
                        <h3 className="popup-title">Booking Required</h3>
                        <p className="popup-message">
                            You need to book this technician before you can chat. Once they accept your booking, you can start chatting.
                        </p>
                        <div className="popup-actions">
                            <button
                                className="popup-btn book-btn"
                                onClick={() => {
                                    setShowPopup(false);
                                    // You would need to find the full tech object here to pass it to handleBookClick
                                    const techToBook = filteredTechnicians.find(t => t.id === selectedTechnicianId);
                                    if(techToBook) handleBookClick(techToBook);
                                }}
                            >
                                Book Now
                            </button>
                            <button
                                className="popup-btn back-btn"
                                onClick={() => setShowPopup(false)}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceTechniciansPage;