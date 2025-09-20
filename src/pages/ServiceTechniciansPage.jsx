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
// Correctly import onValue from firebase/database
import { ref, get, child, onValue } from "firebase/database";
import { database } from '../firebase';
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
import surveyorsImg from '../assets/surveyors.png';
import developersHeroImg from '../assets/SoftwareDeveloper.png';
import bodymassageHeroImg from '../assets/BodyMassage.png';
import constructioncleanersHeroImg from '../assets/Construction cleaners.png';
import laundryHeroImg from '../assets/laundry.png';
import deliveryHeroImg from '../assets/delivery.png';

// Hero banner data
const serviceHeroData = {
    plumber: {
        title: 'Plumber',
        description: 'Professional plumbing services for leak repairs, pipe fittings, installations, and maintenance.',
        image: plumberHeroImg
    },
    electrician: {
        title: 'Electrician',
        description: 'Expert electrical work including wiring, installations, repairs, and safety inspections.',
        image: electricianHeroImg
    },
    'ac-mechanic': {
        title: 'AC Mechanic',
        description: 'Air conditioning repair, installation, and maintenance by certified technicians.',
        image: acMechanicHeroImg
    },
    carpenter: {
        title: 'Carpenter',
        description: 'Custom carpentry, furniture repair, and installation services.',
        image: carpenterHeroImg
    },
    'packers-movers': {
        title: 'Packers & Movers',
        description: 'Reliable and efficient packing and moving services for home and office relocations.',
        image: packersHeroImg
    },
    'house-cleaners': {
        title: 'House cleaners',
        description: 'Professional cleaning services for residential properties, including deep cleaning and routine maintenance.',
        image: housecleanersHeroImg
    },
    laundry: {
        title: 'Laundry',
        description: 'Expert laundry and dry-cleaning services with pick-up and delivery options.',
        image: laundryHeroImg
    },
    'contruction-cleaners': {
        title: 'Construction Cleaners',
        description: 'Post-construction cleaning services to prepare new or renovated buildings for occupancy.',
        image: constructioncleanersHeroImg
    },
    surveyors: {
        title: 'Surveyors',
        description: 'Precise land and property surveying services for various purposes.',
        image: surveyorsImg
    },
    'camera-fittings': {
        title: 'Camera Fittings',
        description: 'Installation and maintenance of security cameras and surveillance systems.',
        image: camerafittingsHeroImg
    },
    developers: {
        title: 'Developers',
        description: 'Software and web development services for custom applications and websites.',
        image: developersHeroImg
    },
    delivery: {
        title: 'Delivery',
        description: 'Fast and reliable courier and delivery services for packages and documents.',
        image: deliveryHeroImg
    },
    welders: {
        title: 'Welders',
        description: 'Skilled welding services for metal fabrication, repair, and construction.',
        image: welderHeroImg
    },
    'private-investigators': {
        title: 'Private Investigators',
        description: 'Confidential and professional investigative services for personal and corporate needs.',
        image: privateinvestigatorsHeroImg
    },
    'body-massage': {
        title: 'Spa(BodyCare)',
        description: 'Relaxing and therapeutic body massage services from certified professionals.',
        image: bodymassageHeroImg
    }
};

const ServiceTechniciansPage = () => {
    const { serviceName } = useParams();
    const navigate = useNavigate();

    const [allTechnicians, setAllTechnicians] = useState([]);
    const [filteredTechnicians, setFilteredTechnicians] = useState([]);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [selectedRating, setSelectedRating] = useState('All Ratings');
    const [selectedHourlyPrice, setSelectedHourlyPrice] = useState('All');
    const [selectedDaylyPrice, setSelectedDaylyPrice] = useState('All');
    const [selectedAvailability, setSelectedAvailability] = useState('All Availability');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);

    const heroData = serviceHeroData[serviceName];

    useEffect(() => {
        const fetchAllData = async () => {
            const dbRef = ref(database);
            try {
                const [usersSnapshot, servicesSnapshot] = await Promise.all([
                    get(child(dbRef, 'users')),
                    get(child(dbRef, 'services'))
                ]);

                const usersData = usersSnapshot.val();
                const servicesData = servicesSnapshot.val();

                if (usersData && servicesData) {
                    const serviceEntry = Object.entries(servicesData).find(([key, service]) =>
                        service.title.toLowerCase().replace(/\s/g, '-') === serviceName
                    );

                    if (serviceEntry) {
                        const serviceId = serviceEntry[0];
                        setServiceDetails(serviceEntry[1]);

                        const technicians = Object.values(usersData).filter(user =>
                            user.role === 'technician' && user.skills && user.skills.includes(serviceId) && user.isActive
                        );
                        setAllTechnicians(technicians);
                        setFilteredTechnicians(technicians);
                    } else {
                        setAllTechnicians([]);
                        setFilteredTechnicians([]);
                    }
                } else {
                    console.log("No data available");
                }
            } catch (error) {
                console.error(error);
            }
        };

        const unsubscribe = onValue(ref(database, 'users'), () => {
          fetchAllData();
        });

        return () => unsubscribe();
    }, [serviceName]);

    useEffect(() => {
        handleApplyFilters();
    }, [selectedRating, selectedHourlyPrice, selectedDaylyPrice, selectedAvailability, allTechnicians]);

    const handleApplyFilters = () => {
        let newFilteredList = [...allTechnicians];

        if (selectedRating !== 'All Ratings') {
            const minRating = parseFloat(selectedRating.replace('+ Stars', ''));
            newFilteredList = newFilteredList.filter((tech) => parseFloat(tech.averageRating) >= minRating);
        }

        if (selectedHourlyPrice !== 'All') {
            const hourlyPriceRange = selectedHourlyPrice.split('-');
            const minPrice = parseInt(hourlyPriceRange[0].replace('₹', ''), 10);
            const maxPrice = hourlyPriceRange[1] ? parseInt(hourlyPriceRange[1].replace('/hour', ''), 10) : Infinity;

            newFilteredList = newFilteredList.filter((tech) =>
                tech.price?.type === 'hourly' && tech.price?.amount >= minPrice && tech.price?.amount <= maxPrice
            );
        }

        if (selectedDaylyPrice !== 'All') {
            const daylyPriceRange = selectedDaylyPrice.split('-');
            const minPrice = parseInt(daylyPriceRange[0].replace('₹', ''), 10);
            const maxPrice = daylyPriceRange[1] ? parseInt(daylyPriceRange[1].replace('/day', ''), 10) : Infinity;

            newFilteredList = newFilteredList.filter((tech) =>
                tech.price?.type === 'dayly' && tech.price?.amount >= minPrice && tech.price?.amount <= maxPrice
            );
        }
        
        if (selectedDaylyPrice !== 'All' && selectedHourlyPrice === 'All') {
          newFilteredList = newFilteredList.filter((tech) => tech.price?.type === 'dayly');
        }
        if (selectedHourlyPrice !== 'All' && selectedDaylyPrice === 'All') {
          newFilteredList = newFilteredList.filter((tech) => tech.price?.type === 'hourly');
        }

        if (selectedAvailability !== 'All Availability') {
            if (selectedAvailability === 'Available Now' || selectedAvailability === 'Available Today') {
                newFilteredList = newFilteredList.filter((tech) => tech.isActive);
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
        
        sessionStorage.setItem('selectedTechnician', JSON.stringify(technician));

        if (isLoggedIn) {
            navigate(`/booking/${serviceName}/${technician.uid}`);
        } else {
            localStorage.setItem("redirectAfterLogin", `/booking/${serviceName}/${technician.uid}`);
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
                            <h1 className="banner-title">{heroData.title} Services</h1>
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
                            <select className="filter-select" value={selectedHourlyPrice} onChange={(e) => { setSelectedHourlyPrice(e.target.value); setSelectedDaylyPrice('All'); }}>
                                <option>Hourly prices</option>
                                <option>₹20-50/hour</option>
                                <option>₹50-100/hour</option>
                                <option>₹100+/hour</option>
                            </select>
                            <select className="filter-select" value={selectedDaylyPrice} onChange={(e) => { setSelectedDaylyPrice(e.target.value); setSelectedHourlyPrice('All'); }}>
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
                            {filteredTechnicians.map((tech) => (
                                <div className="technician-card" key={tech.uid}>
                                    <div className="card-header">
                                        <img src={tech.profileImage} alt={tech.firstName} className="tech-image" />
                                        <div className="tech-info">
                                            <h3 className="tech-name">{tech.firstName} {tech.lastName}</h3>
                                            <div className="tech-rating">
                                                <FaStar className="star-icon" />
                                                <span>{tech.averageRating ? tech.averageRating.toFixed(1) : 'N/A'} ({tech.totalRatings || 0} reviews)</span>
                                            </div>
                                            <div className="tech-details">
                                                <p><FaClock /> {tech.yearsOfExperience ? `${tech.yearsOfExperience} years` : 'N/A'} experience</p>
                                                <p><FaMapMarkerAlt /> {tech.city}</p>
                                                <p className={`tech-status ${tech.isActive ? 'available' : 'busy'}`}>
                                                    {tech.isActive ? 'Available' : 'Busy'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="tech-price">
                                            ₹{tech.price?.amount || 'N/A'}
                                            <br />
                                            per {tech.price?.type || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="tech-actions">
                                        <button className="tech-contact-btn chat-btn" onClick={() => handleChatClick(tech.uid)}>
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
                                    const techToBook = allTechnicians.find(t => t.uid === selectedTechnicianId);
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