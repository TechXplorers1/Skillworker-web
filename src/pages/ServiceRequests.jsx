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
import '../styles/ServiceRequests.css';

const ServiceRequests = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedDate, setSelectedDate] = useState('');
  const [allRequests, setAllRequests] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [currentTechnicianId, setCurrentTechnicianId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentTechnicianId(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!currentTechnicianId) return;

    const usersRef = ref(database, 'users');
    const bookingsRef = ref(database, 'bookings');
    
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      setUsersData(snapshot.val() || {});
    });

    const unsubscribeBookings = onValue(bookingsRef, (snapshot) => {
      const allBookings = snapshot.val();
      if (allBookings) {
        let technicianRequests = Object.entries(allBookings)
          .filter(([key, booking]) => booking.technicianId === currentTechnicianId)
          .map(([key, booking]) => ({
            id: key,
            ...booking,
            status: booking.status === 'completed' ? 'History' : booking.status || 'pending'
          }));
        
        technicianRequests.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        setAllRequests(technicianRequests);
      } else {
        setAllRequests([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeBookings();
    };
  }, [currentTechnicianId]);

  const serviceTypes = ['All Services', ...new Set(allRequests.map(request => request.serviceName))];
  const statusFilters = ['pending', 'accepted', 'cancelled', 'History'];

  const filteredRequests = allRequests.filter((request) => {
    const matchesStatus = activeFilter.toLowerCase() === request.status.toLowerCase();
    const matchesService = selectedService === 'All Services' || request.serviceName === selectedService;
    const matchesDate = !selectedDate || new Date(request.date).toDateString() === new Date(selectedDate).toDateString();
    const matchesSearch = searchTerm === '' ||
      request.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usersData[request.uid]?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesService && matchesDate && matchesSearch;
  });

  const handleAcceptRequest = (requestId) => {
    const requestRef = ref(database, `bookings/${requestId}`);
    update(requestRef, { status: 'accepted' })
      .catch(error => console.error("Failed to accept request:", error));
  };

  const handleDeclineRequest = (requestId) => {
    const requestRef = ref(database, `bookings/${requestId}`);
    update(requestRef, { status: 'cancelled' })
      .catch(error => console.error("Failed to decline request:", error));
  };

  const handleCancelRequest = (requestId) => {
    const requestRef = ref(database, `bookings/${requestId}`);
    update(requestRef, { status: 'cancelled' })
      .catch(error => console.error("Failed to cancel request:", error));
  };

  const handleCompleteRequest = (requestId) => {
    const requestRef = ref(database, `bookings/${requestId}`);
    update(requestRef, { status: 'completed' })
      .catch(error => console.error("Failed to complete request:", error));
  };

  const handleChatClick = (request) => {
    navigate('/chat/request', { 
      state: { 
        user: usersData[request.uid],
        bookingDetails: {
          service: request.serviceName,
          date: request.date,
          time: request.timing,
          description: request.description
        }
      } 
    });
  };

  if (loading) {
    return <div>Loading service requests...</div>;
  }

  return (
    <div className="service-requests-page-container">
      <Header />
      <main className="service-requests-main-content">
        <div className="requests-header">
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
                    id={filter.toLowerCase()}
                    checked={activeFilter.toLowerCase() === filter.toLowerCase()}
                    onChange={() => setActiveFilter(filter)}
                  />
                  <label htmlFor={filter.toLowerCase()}>{filter}</label>
                </React.Fragment>
            ))}
            <div className="glass-glider2" />
          </div>
        </div>

        <div className="requests-list">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div key={request.id} className={`request-card ${request.status.toLowerCase()}`}>
                <div className="request-card-header">
                  <div className="service-info">
                    <span className="service-title">{request.serviceName}</span>
                    <span className="booked-on">Booked on: {new Date(request.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="header-right-section">
                    <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
                  </div>
                </div>

                <div className="user-info-row">
                  <div className="user-avatar-wrapper">
                      <span className="user-avatar-placeholder">
                        {(usersData[request.uid]?.firstName || 'U').charAt(0)}
                      </span>
                  </div>
                  <div className="user-details">
                    <span className="user-name">User: {usersData[request.uid]?.firstName} {usersData[request.uid]?.lastName}</span>
                    <span className="user-address">Address: {usersData[request.uid]?.address || 'N/A'}</span>
                    <div className="user-rating">
                      <FaStar className="star-icon" />
                      <span>{usersData[request.uid]?.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="request-details-grid">
                  <div className="detail-row">
                    <FaRegClock className="detail-icon" />
                    <span>Date: {request.date}</span>
                  </div>
                  <div className="detail-row">
                    <FaRegClock className="detail-icon" />
                    <span>Timings: {request.timing}</span>
                  </div>
                  <div className="detail-row">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{usersData[request.uid]?.city || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <FaRupeeSign className="detail-icon rupee-icon" />
                    <span>N/A</span>
                  </div>
                </div>
                  
                <div className="description-row">
                  <span className="description-label">Description:</span>
                  <span className="request-description">{request.description}</span>
                </div>

                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="action-btn1 decline-btn"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      Decline
                    </button>
                    <button 
                      className="action-btn1 accept-btn"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </button>
                  </div>
                )}

                 {request.status === 'accepted' && (
                  <div className="request-actions">
                    <button 
                      className="action-btn1 cancel-btn"
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="action-btn1 chat-btn"
                      onClick={() => handleChatClick(request)}
                    >
                      Chat
                    </button>
                    <button 
                      className="action-btn1 complete-btn"
                      onClick={() => handleCompleteRequest(request.id)}
                    >
                      Complete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-results-message">
              <p>No requests found for the selected filter or search term.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceRequests;