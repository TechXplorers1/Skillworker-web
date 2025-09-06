import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaUserCircle,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaRegClock,
  FaDollarSign,
  FaEllipsisV,
  FaStar,
} from 'react-icons/fa';
import '../styles/MyBookingsPage.css';

const MyBookingsPage = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder data for bookings
  const allBookings = [
    {
      id: 'bkg1',
      service: 'Electrician',
      technicianName: 'TECHY 1',
      technicianRating: '4.8',
      technicianAvatar: '/path/to/techy1-avatar.png',
      status: 'Canceled',
      date: '9/6/2025',
      time: '1:25 PM',
      duration: '1-3 hours',
      location: 'Wuse II, Abuja',
      price: 120,
      description: 'electrician booking',
    },
    {
      id: 'bkg2',
      service: 'Plumbing Repair',
      technicianName: 'Alex Thompson',
      technicianRating: '4.8',
      technicianAvatar: '/path/to/alex-avatar.png',
      status: 'Active',
      date: 'Today',
      time: '2:00 PM',
      duration: '2-3 hours',
      location: 'Wuse II, Abuja',
      price: 135,
      description: 'kitchen sink leak repair',
      estimatedArrival: '15 minutes',
    },
    {
      id: 'bkg3',
      service: 'AC Mechanic',
      technicianName: 'COOLFIX 1',
      technicianRating: '4.7',
      technicianAvatar: '/path/to/coolfix1-avatar.png',
      status: 'Pending',
      date: '9/7/2025',
      time: '10:00 AM',
      duration: '1 hour',
      location: 'Wuse II, Abuja',
      price: 70,
      description: 'AC check-up and service',
    },
    {
      id: 'bkg4',
      service: 'Welder',
      technicianName: 'IRONFIX 1',
      technicianRating: '4.5',
      technicianAvatar: '/path/to/ironfix1-avatar.png',
      status: 'Accepted',
      date: '9/8/2025',
      time: '9:30 AM',
      duration: '4 hours',
      location: 'Wuse II, Abuja',
      price: 380,
      description: 'Gate welding repair',
    },
    {
      id: 'bkg5',
      service: 'Electrician',
      technicianName: 'ELECTRO 2',
      technicianRating: '4.7',
      technicianAvatar: '/path/to/electro2-avatar.png',
      status: 'Completed',
      date: '9/4/2025',
      time: '11:00 AM',
      duration: '1-2 hours',
      location: 'Wuse II, Abuja',
      price: 450,
      description: 'house wiring',
    },
  ];

  const filteredBookings = allBookings.filter((booking) => {
    const matchesFilter = activeFilter === 'All' || booking.status === activeFilter;
    const matchesSearch = booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleBookingClick = (bookingId) => {
    // Navigate to a specific booking details page
    // The path here is a placeholder, you'd need to create a BookingDetailsPage component
    navigate(`/booking-details/${bookingId}`);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };
  const handleBecomeTechnicianClick = () => {
    // Placeholder for technician sign-up page
    navigate('/become-a-technician');
  };

  return (
    <div className="my-bookings-page-container">
      <Header /> {/* Replaced static header with imported component */}
      <main className="my-bookings-main-content">
        <div className="bookings-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.2l105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
            My Bookings
          </button>
          <div className="filter-search-bar">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        <div className="bookings-summary">
          <span>{allBookings.length} total bookings</span>
          <span>•</span>
          <span className="completed-services-cost">${allBookings.filter(b => b.status === 'Completed').reduce((sum, b) => sum + b.price, 0)} spent on completed services</span>
        </div>

        <div className="booking-filters-tabs">
          <button className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>All</button>
          <button className={`filter-tab ${activeFilter === 'Pending' ? 'active' : ''}`} onClick={() => setActiveFilter('Pending')}>Pending</button>
          <button className={`filter-tab ${activeFilter === 'Accepted' ? 'active' : ''}`} onClick={() => setActiveFilter('Accepted')}>Accepted</button>
          <button className={`filter-tab ${activeFilter === 'Canceled' ? 'active' : ''}`} onClick={() => setActiveFilter('Canceled')}>Canceled</button>
          <button className={`filter-tab ${activeFilter === 'Completed' ? 'active' : ''}`} onClick={() => setActiveFilter('Completed')}>Completed</button>
        </div>

        <div className="bookings-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className={`booking-card ${booking.status.toLowerCase()}`} onClick={() => handleBookingClick(booking.id)}>
                <div className="booking-card-header">
                  <div className="service-info">
                    <span className="service-title">{booking.service}</span>
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </div>
                  <FaEllipsisV className="card-options" />
                </div>
                <div className="technician-info-row">
                  <div className="tech-avatar-container">
                    {/* Placeholder avatar or icon */}
                    <div className="tech-initials">T</div>
                    {/* If using an image, uncomment and provide the path */}
                    {/* <img src={booking.technicianAvatar} alt={booking.technicianName} className="tech-avatar" /> */}
                  </div>
                  <div className="tech-name-rating">
                    <span className="tech-name">{booking.technicianName}</span>
                    <div className="tech-rating">
                      <FaStar className="star-icon" />
                      <span>{booking.technicianRating}</span>
                    </div>
                  </div>
                </div>
                <div className="booking-details">
                  <p><FaRegClock /> {booking.date} at {booking.time}</p>
                  <p><FaRegClock /> {booking.duration}</p>
                  <p><FaMapMarkerAlt /> {booking.location}</p>
                  <p><FaDollarSign /> ${booking.price}</p>
                  {booking.estimatedArrival && (
                    <p className="eta">Estimated arrival: {booking.estimatedArrival}</p>
                  )}
                  <p className="booking-description">"{booking.description}"</p>
                </div>
                {booking.status === 'Canceled' && (
                  <button className="book-similar-btn">Book Similar Service</button>
                )}
              </div>
            ))
          ) : (
            <div className="no-results-message">
              <p>No bookings found for the selected filter or search term.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBookingsPage;