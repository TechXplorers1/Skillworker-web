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
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedDate, setSelectedDate] = useState('');

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
      dateObj: new Date('2025-09-09'),
      time: '2:00 PM',
      duration: '2-3 hours',
      location: 'Bengaluru',
      price: 1350,
      description: 'Kitchen sink leak repair',
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
      dateObj: new Date('2025-09-10'),
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
      dateObj: new Date('2024-12-10'),
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
      date: 'Sep 8, 2025',
      dateObj: new Date('2025-09-08'),
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
      date: 'Sep 4, 2025',
      dateObj: new Date('2025-09-04'),
      time: '11:00 AM',
      duration: '1-2 hours',
      location: 'Mumbai',
      price: 4500,
      description: 'house wiring',
      bookingId: '#45'
    },
  ];

  const serviceTypes = ['All Services', ...new Set(allBookings.map(booking => booking.service))];

  const filteredBookings = allBookings.filter((booking) => {
    const matchesStatus = activeFilter === 'All' || booking.status === activeFilter;
    const matchesService = selectedService === 'All Services' || booking.service === selectedService;
    const matchesDate = !selectedDate || booking.dateObj.toDateString() === new Date(selectedDate).toDateString();
    const matchesSearch = searchTerm === '' ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesService && matchesDate && matchesSearch;
  });

  const handleBookingClick = (bookingId) => {
    navigate(`/booking-details/${bookingId}`);
  };

  return (
    <div className="my-bookings-page-container">
      <Header />
      <main className="my-bookings-main-content">
        <div className="bookings-header">
          <div className="filter-search-bar">
            <select
              className="service-select"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {serviceTypes.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="toggle-container">
          <div className="glass-radio-group">
            <input
              type="radio"
              name="plan"
              id="all"
              checked={activeFilter === 'All'}
              onChange={() => setActiveFilter('All')}
            />
            <label htmlFor="all">All</label>
            <input
              type="radio"
              name="plan"
              id="active"
              checked={activeFilter === 'Active'}
              onChange={() => setActiveFilter('Active')}
            />
            <label htmlFor="active">Active</label>
            <input
              type="radio"
              name="plan"
              id="upcoming"
              checked={activeFilter === 'Upcoming'}
              onChange={() => setActiveFilter('Upcoming')}
            />
            <label htmlFor="upcoming">Upcoming</label>
            <input
              type="radio"
              name="plan"
              id="completed"
              checked={activeFilter === 'Completed'}
              onChange={() => setActiveFilter('Completed')}
            />
            <label htmlFor="completed">Completed</label>
            <input
              type="radio"
              name="plan"
              id="canceled"
              checked={activeFilter === 'Canceled'}
              onChange={() => setActiveFilter('Canceled')}
            />
            <label htmlFor="canceled">Canceled</label>
            <div className="glass-glider" />
          </div>
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