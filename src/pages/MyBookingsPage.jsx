import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaRegClock,
  FaRupeeSign,
  FaStar,
} from 'react-icons/fa';
import { ref, onValue, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from '../firebase';
import '../styles/MyBookingsPage.css';

const MyBookingsPage = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedDate, setSelectedDate] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!currentUserId) return;

    const usersRef = ref(database, 'users');
    const bookingsRef = ref(database, 'bookings');
    
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      setUsersData(snapshot.val() || {});
    });

    const unsubscribeBookings = onValue(bookingsRef, (snapshot) => {
      const allBookingsData = snapshot.val();
      if (allBookingsData) {
        let userBookings = Object.entries(allBookingsData)
          .filter(([key, booking]) => booking.uid === currentUserId)
          .map(([key, booking]) => ({
            id: key,
            ...booking,
            status: booking.status || 'pending'
          }));
        
        userBookings.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        setAllBookings(userBookings);
      } else {
        setAllBookings([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeBookings();
    };
  }, [currentUserId]);

  const serviceTypes = ['All Services', ...new Set(allBookings.map(booking => booking.serviceName))];
  const statusFilters = ['pending', 'accepted', 'completed', 'cancelled'];

  const filteredBookings = allBookings.filter((booking) => {
    const matchesStatus = activeFilter === booking.status;
    const matchesService = selectedService === 'All Services' || booking.serviceName === selectedService;
    const matchesDate = !selectedDate || new Date(booking.date).toDateString() === new Date(selectedDate).toDateString();
    const matchesSearch = searchTerm === '' ||
      booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usersData[booking.technicianId]?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesService && matchesDate && matchesSearch;
  });

  const handleCancelBooking = (bookingId) => {
    const bookingRef = ref(database, `bookings/${bookingId}`);
    update(bookingRef, { status: 'cancelled' })
      .catch(error => console.error("Failed to cancel booking:", error));
  };

  const handleCompleteBooking = (bookingId) => {
    const bookingRef = ref(database, `bookings/${bookingId}`);
    update(bookingRef, { status: 'completed' })
      .catch(error => console.error("Failed to complete booking:", error));
  };

  const handleChatClick = (booking) => {
    navigate('/chat/booking', { 
      state: { 
        technician: usersData[booking.technicianId],
        bookingDetails: {
          service: booking.serviceName,
          date: booking.date,
          time: booking.timing,
          description: booking.description
        }
      } 
    });
  };

  if (loading) {
    return <div>Loading bookings...</div>;
  }

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
            {statusFilters.map(filter => (
                <React.Fragment key={filter}>
                  <input
                    type="radio"
                    name="plan"
                    id={filter}
                    checked={activeFilter === filter}
                    onChange={() => setActiveFilter(filter)}
                  />
                  <label htmlFor={filter}>{filter}</label>
                </React.Fragment>
            ))}
            <div className="glass-glider1" />
          </div>
        </div>

        <div className="bookings-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className={`booking-card ${booking.status.toLowerCase()}`}>
                <div className="booking-card-header">
                  <div className="service-info">
                    <span className="service-title">{booking.serviceName}</span>
                    <span className="booked-on">Booked on: {new Date(booking.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="header-right-section">
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </div>
                </div>

                <div className="technician-info-row">
                  <div className="tech-avatar-wrapper">
                      <span className="tech-avatar-placeholder">
                        {(usersData[booking.technicianId]?.firstName || 'T').charAt(0)}
                      </span>
                  </div>
                  <div className="tech-name-rating">
                    <span className="tech-name">Technician: {usersData[booking.technicianId]?.firstName} {usersData[booking.technicianId]?.lastName}</span>
                    <div className="tech-rating">
                      <FaStar className="star-icon" />
                      <span>{usersData[booking.technicianId]?.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="booking-details-grid">
                  <div className="detail-row">
                    <FaRegClock className="detail-icon" />
                    <span>Date: {booking.date}</span>
                  </div>
                  <div className="detail-row">
                    <FaRegClock className="detail-icon" />
                    <span>Timings: {booking.timing}</span>
                  </div>
                  <div className="detail-row">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{usersData[booking.technicianId]?.city || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <FaRupeeSign className="detail-icon rupee-icon" />
                    <span>N/A</span>
                  </div>
                </div>
                  
                <div className="description-row">
                  <span className="description-label">Description:</span>
                  <span className="booking-description">{booking.description}</span>
                </div>

                {booking.status === 'pending' && (
                  <div className="booking-actions">
                    <button 
                      className="action-btn1 cancel-btn"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'accepted' && (
                  <div className="booking-actions">
                    <button 
                      className="action-btn1 cancel-btn"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="action-btn1 chat-btn"
                      onClick={() => handleChatClick(booking)}
                    >
                      Chat
                    </button>
                    <button 
                      className="action-btn1 complete-btn"
                      onClick={() => handleCompleteBooking(booking.id)}
                    >
                      Complete
                    </button>
                  </div>
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