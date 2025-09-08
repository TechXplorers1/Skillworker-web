import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaRegClock,
  FaRupeeSign,
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
      service: 'Plumbing Repair',
      technicianName: 'Alex Thompson',
      technicianRating: '4.8',
      technicianAvatar: '/path/to/techy1-avatar.png',
      status: 'Active',
      date: 'Today',
      time: '2:00 PM',
      duration: '2-3 hours',
      location: 'Bengaluru',
      price: 1350,
      description: 'Kitchen sink leak repair',
      estimatedArrival: '15 minutes',
      bookingId: '#48'
    },
    {
      id: 'bkg2',
      service: 'Electrical Work',
      technicianName: 'Sarah Johnson',
      technicianRating: '4.9',
      technicianAvatar: '/path/to/alex-avatar.png',
      status: 'Upcoming',
      date: 'Tomorrow',
      time: '10:00 AM',
      duration: '1-2 hours',
      location: 'Mumbai',
      price: 850,
      description: 'Install ceiling fan in bedroom',
      bookingId: '#49'
    },
    {
      id: 'bkg3',
      service: 'AC Repair',
      technicianName: 'Mike Wilson',
      technicianRating: '4.7',
      technicianAvatar: '/path/to/coolfix1-avatar.png',
      status: 'Completed',
      date: 'Dec 10, 2024',
      time: '3:00 PM',
      duration: '2 hours',
      location: 'Delhi',
      price: 1200,
      description: 'AC not cooling properly',
      bookingId: '#47'
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
      location: 'Bengaluru',
      price: 3800,
      description: 'Gate welding repair',
      bookingId: '#46'
    },
    {
      id: 'bkg5',
      service: 'Electrician',
      technicianName: 'ELECTRO 2',
      technicianRating: '4.7',
      technicianAvatar: '/path/to/electro2-avatar.png',
      status: 'Canceled',
      date: '9/4/2025',
      time: '11:00 AM',
      duration: '1-2 hours',
      location: 'Mumbai',
      price: 4500,
      description: 'house wiring',
      bookingId: '#45'
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
    navigate(`/booking-details/${bookingId}`);
  };

  return (
    <div className="my-bookings-page-container">
      <Header />
      <main className="my-bookings-main-content">
        <div className="bookings-header">
          {/* <button className="back-btn" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.2l105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
            My Bookings
          </button> */}
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

        <div className="booking-filters-tabs">
          <button className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>All</button>
          <button className={`filter-tab ${activeFilter === 'Active' ? 'active' : ''}`} onClick={() => setActiveFilter('Active')}>Active</button>
          <button className={`filter-tab ${activeFilter === 'Upcoming' ? 'active' : ''}`} onClick={() => setActiveFilter('Upcoming')}>Upcoming</button>
          <button className={`filter-tab ${activeFilter === 'Completed' ? 'active' : ''}`} onClick={() => setActiveFilter('Completed')}>Completed</button>
          <button className={`filter-tab ${activeFilter === 'Canceled' ? 'active' : ''}`} onClick={() => setActiveFilter('Canceled')}>Canceled</button>
        </div>

        <div className="bookings-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className={`booking-card ${booking.status.toLowerCase()}`}>
                <div className="booking-card-header">
                  <div className="service-info">
                    <span className="service-title">{booking.service}</span>
                  </div>
                  <div className="header-right-section">
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                    <FaEllipsisV className="card-options" />
                  </div>
                </div>

                <div className="technician-info-row">
                  <div className="tech-avatar-wrapper">
                      {/* You would use an img tag here with a source */}
                      <span className="tech-avatar-placeholder">
                        {booking.technicianName.charAt(0)}
                      </span>
                  </div>
                  <div className="tech-name-rating">
                    <span className="tech-name">{booking.technicianName}</span>
                    <div className="tech-rating">
                      <FaStar className="star-icon" />
                      <span>{booking.technicianRating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="booking-details-grid">
                  <div className="detail-row">
                    <FaRegClock className="detail-icon" />
                    <span>{booking.date} at {booking.time}</span>
                  </div>
                  <div className="detail-row">
                    <FaRegClock className="detail-icon" />
                    <span>{booking.duration}</span>
                  </div>
                  <div className="detail-row">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="detail-row">
                    <FaRupeeSign className="detail-icon rupee-icon" />
                    <span>{booking.price}</span>
                  </div>
                </div>
                  
                {booking.estimatedArrival && (
                  <div className="eta-row">
                    <span className="eta-label">Estimated arrival:</span>
                    <span className="eta-value">{booking.estimatedArrival}</span>
                  </div>
                )}
                  
                <div className="description-row">
                  <span className="booking-description">"{booking.description}"</span>
                </div>
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