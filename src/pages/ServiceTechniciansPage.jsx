import React, { useState, useEffect, useCallback } from 'react';
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
import { ref, get, child, onValue } from "firebase/database";
import { database, auth } from '../firebase';
import '../styles/ServiceTechniciansPage.css';

// Hero images (assuming these imports are correct)
import plumberHeroImg from '../assets/plumber.jpeg';
import electricianHeroImg from '../assets/electrician.jpeg';
import acMechanicHeroImg from '../assets/ac_mechanic.jpeg';
import carpenterHeroImg from '../assets/carpenter.jpeg';
import packersHeroImg from '../assets/packers_movers.jpeg';
import housecleanersHeroImg from '../assets/house_cleaners.jpeg';
import camerafittingsHeroImg from '../assets/cam_fitting.jpeg';
import privateinvestigatorsHeroImg from '../assets/private_investigators.jpeg';
import welderHeroImg from '../assets/welders.jpeg';
import surveyorsImg from '../assets/surveyors.jpeg';
import developersHeroImg from '../assets/software_dev.jpeg';
import bodymassageHeroImg from '../assets/body_massage.jpeg';
import constructioncleanersHeroImg from '../assets/Construction.jpeg';
import laundryHeroImg from '../assets/laundry.jpeg';
import deliveryHeroImg from '../assets/delivery.jpeg';

// --- IN-MEMORY CACHE (Only keeping service details cache to avoid re-fetching image mapping) ---
let pageCache = {
    serviceDetails: {}, // Key: serviceName (slug)
};

// Map service slugs to local images
const serviceImageMap = {
    'plumber': plumberHeroImg,
    'electrician': electricianHeroImg,
    'ac-mechanic': acMechanicHeroImg,
    'carpenter': carpenterHeroImg,
    'packers-movers': packersHeroImg,
    'house-cleaners': housecleanersHeroImg,
    'laundry': laundryHeroImg,
    'contruction-cleaners': constructioncleanersHeroImg,
    'surveyors': surveyorsImg,
    'camera-fittings': camerafittingsHeroImg,
    'developers': developersHeroImg,
    'delivery': deliveryHeroImg,
    'welders': welderHeroImg,
    'private-investigators': privateinvestigatorsHeroImg,
    'body-massage': bodymassageHeroImg
};

const ServiceTechniciansPage = () => {
    const { serviceName } = useParams();
    const navigate = useNavigate();

    const [allTechnicians, setAllTechnicians] = useState([]);
    const [filteredTechnicians, setFilteredTechnicians] = useState([]);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [serviceId, setServiceId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [selectedRating, setSelectedRating] = useState('All Ratings');
    const [selectedHourlyPrice, setSelectedHourlyPrice] = useState('All');
    const [selectedDaylyPrice, setSelectedDaylyPrice] = useState('All');
    const [selectedAvailability, setSelectedAvailability] = useState('All Availability');
    
    // Popup states
    const [showPopup, setShowPopup] = useState(false);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);

    const localHeroImage = serviceImageMap[serviceName];

    const handleApplyFilters = useCallback((techniciansToFilter = allTechnicians) => {
        let newFilteredList = [...techniciansToFilter];

        if (selectedRating !== 'All Ratings') {
            const minRating = parseFloat(selectedRating.replace('+ Stars', ''));
            newFilteredList = newFilteredList.filter((tech) => parseFloat(tech.averageRating) >= minRating);
        }

        const isHourlyFilterSet = selectedHourlyPrice !== 'All' && selectedDaylyPrice === 'All';
        const isDaylyFilterSet = selectedDaylyPrice !== 'All' && selectedHourlyPrice === 'All';
        
        if (isHourlyFilterSet) {
            const hourlyPriceRange = selectedHourlyPrice.split('-');
            const minPrice = parseInt(hourlyPriceRange[0].replace('₹', ''), 10);
            const maxPrice = hourlyPriceRange[1] ? parseInt(hourlyPriceRange[1].replace('/hour', ''), 10) : Infinity;

            newFilteredList = newFilteredList.filter((tech) =>
                tech.price?.type === 'hourly' && tech.price?.amount >= minPrice && tech.price?.amount <= maxPrice
            );
        }

        if (isDaylyFilterSet) {
            const daylyPriceRange = selectedDaylyPrice.split('-');
            const minPrice = parseInt(daylyPriceRange[0].replace('₹', ''), 10);
            const maxPrice = daylyPriceRange[1] ? parseInt(daylyPriceRange[1].replace('/day', ''), 10) : Infinity;

            newFilteredList = newFilteredList.filter((tech) =>
                tech.price?.type === 'dayly' && tech.price?.amount >= minPrice && tech.price?.amount <= maxPrice
            );
        }
        
        if (selectedAvailability !== 'All Availability') {
            if (selectedAvailability === 'Available Now' || selectedAvailability === 'Available Today') {
                newFilteredList = newFilteredList.filter((tech) => tech.isActive);
            }
        }

        setFilteredTechnicians(newFilteredList);
    }, [allTechnicians, selectedRating, selectedHourlyPrice, selectedDaylyPrice, selectedAvailability]);
    
    // Fetch service details and cache them
    useEffect(() => {
        // 1. CACHE CHECK for Service Details
        if (pageCache.serviceDetails[serviceName]) {
            const cachedData = pageCache.serviceDetails[serviceName];
            setServiceId(cachedData.serviceId);
            setServiceDetails(cachedData.serviceDetails);
            return; 
        }

        // 2. FETCH if cache is empty
        const dbRef = ref(database);
        get(child(dbRef, 'services'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const servicesData = snapshot.val();
                    const serviceEntry = Object.entries(servicesData).find(([key, service]) =>
                        service.title.toLowerCase().replace(/\s/g, '-') === serviceName
                    );

                    if (serviceEntry) {
                        const sId = serviceEntry[0];
                        const dbServiceDetails = serviceEntry[1];
                        const finalDetails = {
                            ...dbServiceDetails,
                            image: localHeroImage || dbServiceDetails.image
                        };
                        
                        setServiceId(sId);
                        setServiceDetails(finalDetails);
                        
                        // 3. CACHE the fetched data
                        pageCache.serviceDetails[serviceName] = {
                            serviceDetails: finalDetails,
                            serviceId: sId
                        };
                    } else {
                        setServiceId(null);
                        setServiceDetails(null);
                        setLoading(false); 
                    }
                } else {
                    setLoading(false); 
                }
            })
            .catch(error => {
                console.error("Error fetching services:", error);
                setLoading(false); 
            });
    }, [serviceName, localHeroImage]);

    // Fetch technicians in real-time
    useEffect(() => {
        if (!serviceId) return;

        // Rely purely on the live listener for real-time updates
        const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
        const usersRef = ref(database, 'users');

        // onValue runs immediately with initial data and updates whenever data changes
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                
                const technicians = Object.values(usersData).filter(user =>
                    user.role === 'technician' && 
                    user.skills && 
                    user.skills.includes(serviceId) && 
                    user.uid !== currentUserId
                );

                const updatedTechnicians = technicians.map(tech => ({
                    ...tech,
                    experience: tech.experience || 'N/A',
                    city: tech.city || 'N/A',
                }));
                
                setAllTechnicians(updatedTechnicians);
                handleApplyFilters(updatedTechnicians);
            } else {
                setAllTechnicians([]);
                handleApplyFilters([]);
            }
            setLoading(false); 
        }, (error) => {
            console.error("Error fetching technicians:", error);
            setLoading(false); 
        });

        return () => unsubscribe();
    }, [serviceId, handleApplyFilters]);

    // Re-apply filters whenever filter selections change
    useEffect(() => {
        handleApplyFilters();
    }, [selectedRating, selectedHourlyPrice, selectedDaylyPrice, selectedAvailability, handleApplyFilters]);

    const handleChatClick = (technicianId) => {
        setSelectedTechnicianId(technicianId);
        setShowPopup(true);
    };

    const handleBookClick = (technician) => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        sessionStorage.setItem('selectedTechnician', JSON.stringify(technician));
        sessionStorage.setItem('serviceName', serviceName);

        if (isLoggedIn) {
            navigate(`/booking/${serviceName}/${technician.uid}`);
        } else {
            localStorage.setItem("redirectAfterLogin", `/booking/${serviceName}/${technician.uid}`);
            navigate("/login");
        }
    };
    
    // Helper function to get initials
    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName[0].toUpperCase() : '';
        const last = lastName ? lastName[0].toUpperCase() : '';
        return first + last;
    }
    
    // Loading Spinner Render Block
    if (loading) {
        return (
            <div className="technicians-page-container">
                <Header />
                <main className="tech-main-content">
                    <div className="loading-state-content">
                        <h2 className="loading-title">Finding Professionals...</h2>
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    // END Loading Spinner Render Block

    return (
        <div className="technicians-page-container">
            <Header />
            <main className="tech-main-content">
                {serviceDetails && (
                    <section className="service-hero-banner" style={{ backgroundImage: `url(${serviceDetails.image})` }}>
                        <div className="hero-overlay"></div>
                        <div className="hero-content">
                            <h1 className="banner-title">{serviceDetails.title} Services</h1>
                            <p className="banner-description">{serviceDetails.description}</p>
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
                            <button className="apply-filter-btn" onClick={() => handleApplyFilters()}>Apply Filters</button>
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
                                    <div className={`activity-dot ${tech.isActive ? 'available' : 'booked'}`}></div>
                                    <div className="card-header">
                                        
                                        {/* --- FIX 1: Replaced image with initials div --- */}
                                        <div className="tech-initials-placeholder">
                                            {getInitials(tech.firstName, tech.lastName)}
                                        </div>
                                        {/* ----------------------------------------------- */}
                                        
                                        <div className="tech-info">
                                            <h3 className="tech-name">{tech.firstName} {tech.lastName}</h3>
                                            <div className="tech-rating">
                                                <FaStar className="star-icon" />
                                                <span>{tech.averageRating ? tech.averageRating.toFixed(1) : 'N/A'} ({tech.totalRatings || 0} reviews)</span>
                                            </div>
                                            <div className="tech-details">
                                                <p><FaClock /> {tech.experience ? `${tech.experience} years` : 'N/A'} experience</p>
                                                <p><FaMapMarkerAlt /> {tech.city || 'N/A'}</p>
                                                <p className={`tech-status ${tech.isActive ? 'available' : 'busy'}`}>
                                                    {tech.isActive ? 'Available' : 'Busy'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tech-actions">
                                        <button className="tech-contact-btn chat-btn" onClick={() => handleChatClick(tech.uid)}>
                                            <FaCommentDots /> Chat
                                        </button>
                                        {/* This button is always enabled, allowing users to book anyone */}
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