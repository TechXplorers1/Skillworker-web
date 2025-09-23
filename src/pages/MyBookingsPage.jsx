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
  FaCalendarAlt,
} from 'react-icons/fa';
import { ref, onValue, update, query, orderByChild, equalTo, get, child } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from '../firebase';
import '../styles/MyBookingsPage.css';

const MyBookingsPage = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [techniciansData, setTechniciansData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const bookingsQuery = query(
      ref(database, 'bookings'),
      orderByChild('uid'),
      equalTo(currentUser.uid)
    );

    const unsubscribeBookings = onValue(bookingsQuery, (snapshot) => {
      const userBookingsData = snapshot.val();
      if (userBookingsData) {
        const bookingsList = Object.entries(userBookingsData)
          .map(([key, booking]) => ({
            id: key,
            ...booking,
          }));
        
        bookingsList.sort((a, b) => b.timestamp - a.timestamp);
        setAllBookings(bookingsList);
      } else {
        setAllBookings([]);
      }
      setLoading(false);
    });

    return () => unsubscribeBookings();
  }, [currentUser]);

  useEffect(() => {
    if (allBookings.length === 0) return;

    const fetchTechnicianData = async () => {
      const technicianIds = [...new Set(allBookings.map(b => b.technicianId))];
      const technicianPromises = technicianIds.map(id =>
        get(child(ref(database), `users/${id}`))
      );

      const technicianSnapshots = await Promise.all(technicianPromises);
      const technicians = {};
      technicianSnapshots.forEach(snapshot => {
        if (snapshot.exists()) {
          technicians[snapshot.key] = snapshot.val();
        }
      });
      setTechniciansData(technicians);
    };

    fetchTechnicianData();
  }, [allBookings]);
  
  const statusFilters = ['Active', 'Accepted', 'Cancelled', 'Completed'];

  const filteredBookings = allBookings.filter((booking) => {
    const technician = techniciansData[booking.technicianId];
    const technicianName = technician ? `${technician.firstName} ${technician.lastName}` : '';

    let matchesStatus = false;
    const bookingStatus = booking.status ? booking.status.toLowerCase() : 'pending';

    // FIX: Active tab should only show pending requests
    if (activeFilter === 'Active') {
      matchesStatus = (bookingStatus === 'pending'); // Only pending bookings in Active tab
    } else if (activeFilter === 'Accepted') {
      matchesStatus = (bookingStatus === 'accepted'); // Only accepted bookings in Accepted tab
    } else {
      matchesStatus = activeFilter.toLowerCase() === bookingStatus;
    }
    
    const matchesSearch = searchTerm === '' ||
      (booking.serviceName && booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      technicianName.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });

  const handleUpdateBookingStatus = (bookingId, status) => {
    const bookingRef = ref(database, `bookings/${bookingId}`);
    const updates = { status: status.toLowerCase() };
    if (status.toLowerCase() === 'cancelled') {
        updates.cancelledAt = new Date().toISOString();
    }
    if (status.toLowerCase() === 'completed') {
        updates.completedAt = new Date().toISOString();
    }
    
    // Optimistic update for instant UI feedback
    setAllBookings(currentBookings =>
      currentBookings.map(b =>
        b.id === bookingId ? { ...b, ...updates } : b
      )
    );

    update(bookingRef, updates)
      .catch(error => console.error(`Failed to update booking to ${status}:`, error));
  };

  if (loading) {
    return <div className="loading-container">Loading your bookings...</div>;
  }

  return (
    <div className="my-bookings-page-container">
      <Header />
      <main className="my-bookings-main-content">
        <div className="bookings-header">
          <div className="filter-search-bar">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by service or technician..."
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
                    name="booking-filter"
                    id={filter.toLowerCase()}
                    checked={activeFilter === filter}
                    onChange={() => setActiveFilter(filter)}
                  />
                  <label htmlFor={filter.toLowerCase()}>{filter}</label>
                </React.Fragment>
            ))}
            <div className="glass-glider1" />
          </div>
        </div>

        <div className="bookings-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => {
              const technician = techniciansData[booking.technicianId];
              const status = booking.status || 'pending';
              const statusClass = status.toLowerCase();

              return (
                <div key={booking.id} className={`booking-card ${statusClass}`}>
                  <div className="booking-card-header">
                    <div className="service-info">
                      <span className="service-title">{booking.serviceName}</span>
                      <span className="booked-on">Booked: {new Date(booking.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="header-right-section">
                      <span className={`status-badge ${statusClass}`}>{status}</span>
                    </div>
                  </div>

                  {technician && (
                    <div className="technician-info-row">
                      <div className="tech-avatar-wrapper">
                          <span className="tech-avatar-placeholder">
                            {technician.firstName?.charAt(0) || 'T'}
                          </span>
                      </div>
                      <div className="tech-name-rating">
                        <span className="tech-name">{technician.firstName} {technician.lastName}</span>
                        <div className="tech-rating">
                          <FaStar className="star-icon" />
                          <span>{technician.averageRating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="booking-details-grid">
                    <div className="detail-row">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <FaRegClock className="detail-icon" />
                      <span>{booking.timing}</span>
                    </div>
                    <div className="detail-row">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{booking.address || 'Address not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <FaRupeeSign className="detail-icon rupee-icon" />
                      <span>{booking.price || 'Price not available'}</span>
                    </div>
                  </div>
                    
                  <div className="description-row">
                    <span className="description-label">Description:</span>
                    <span className="booking-description">{booking.description || 'No description.'}</span>
                  </div>

                  <div className="booking-actions">
                    {/* FIX: Active tab (pending) shows Cancel button */}
                    {status === 'pending' && activeFilter === 'Active' && (
                        <button 
                          className="action-btn1 cancel-btn"
                          onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                    )}

                    {/* FIX: Accepted tab shows Cancel, Chat, and Complete buttons */}
                    {status === 'accepted' && activeFilter === 'Accepted' && (
                      <>
                        <button 
                          className="action-btn1 cancel-btn"
                          onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                        <button className="action-btn1 chat-btn">Chat</button>
                        <button 
                          className="action-btn1 complete-btn"
                          onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                        >
                          Mark as Complete
                        </button>
                      </>
                    )}
                    
                    {/* FIX: Completed tab shows Review button */}
                    {status === 'completed' && activeFilter === 'Completed' && (
                        <button className="action-btn1 review-btn">Leave a Review</button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results-message">
              <p>You have no bookings in the "{activeFilter}" category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBookingsPage;