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
import '../styles/ServiceRequests.css';

const ServiceRequests = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [allRequests, setAllRequests] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [currentTechnician, setCurrentTechnician] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentTechnician(user);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!currentTechnician) return;

    const requestsQuery = query(
      ref(database, 'bookings'),
      orderByChild('technicianId'),
      equalTo(currentTechnician.uid)
    );

    const unsubscribeBookings = onValue(requestsQuery, (snapshot) => {
      const technicianRequestsData = snapshot.val();
      if (technicianRequestsData) {
        const requestsList = Object.entries(technicianRequestsData)
          .map(([key, booking]) => {
            const status = (booking.status || 'pending').toLowerCase();
            let displayStatus;

            switch (status) {
              case 'pending':
                displayStatus = 'requests';
                break;
              case 'accepted':
                displayStatus = 'accepted';
                break;
              case 'completed':
                displayStatus = 'history';
                break;
              case 'cancelled':
                displayStatus = 'cancelled';
                break;
              default:
                displayStatus = status;
            }
            
            return {
              id: key,
              ...booking,
              displayStatus: displayStatus
            };
          });
        
        requestsList.sort((a, b) => b.timestamp - a.timestamp);
        setAllRequests(requestsList);
      } else {
        setAllRequests([]);
      }
      setLoading(false);
    });

    return () => unsubscribeBookings();
  }, [currentTechnician]);

  useEffect(() => {
    if (allRequests.length === 0) return;

    const fetchUserData = async () => {
      const userIds = [...new Set(allRequests.map(r => r.uid))];
      const userPromises = userIds.map(id => {
        if (!id) return null;
        return get(child(ref(database), `users/${id}`));
      }).filter(Boolean);
      
      const userSnapshots = await Promise.all(userPromises);
      const users = {};
      userSnapshots.forEach(snapshot => {
        if (snapshot.exists()) {
          users[snapshot.key] = snapshot.val();
        }
      });
      setUsersData(users);
    };

    fetchUserData();
  }, [allRequests]);

  const statusFilters = ['requests', 'accepted', 'cancelled', 'history'];

  const filteredRequests = allRequests.filter((request) => {
    const user = usersData[request.uid];
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';

    let matchesStatus = false;
    if (request.displayStatus) {
        matchesStatus = activeFilter === request.displayStatus;
    }
    
    const matchesSearch = searchTerm === '' ||
      (request.serviceName && request.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (requestId, status) => {
    const requestRef = ref(database, `bookings/${requestId}`);
    const updates = { status: status.toLowerCase() };

    if (status.toLowerCase() === 'accepted') {
        updates.acceptedAt = new Date().toISOString();
    }
    if (status.toLowerCase() === 'completed') {
        updates.completedAt = new Date().toISOString();
    }

    // Optimistic update
    setAllRequests(currentRequests =>
      currentRequests.map(r =>
        r.id === requestId ? { ...r, ...updates, displayStatus: status.toLowerCase() === 'completed' ? 'history' : status.toLowerCase() } : r
      )
    );

    update(requestRef, updates)
      .catch(error => console.error(`Failed to update status to ${status}:`, error));
  };

  if (loading) {
    return <div className="loading-container">Loading service requests...</div>;
  }

  return (
    <div className="service-requests-page-container">
      <Header />
      <main className="service-requests-main-content">
        <div className="requests-header">
          <div className="filter-search-bar">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by service or user..."
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
                    name="request-filter"
                    id={filter}
                    checked={activeFilter === filter}
                    onChange={() => setActiveFilter(filter)}
                  />
                  <label htmlFor={filter}>{filter === 'cancelled' ? 'Cancelled' : filter.charAt(0).toUpperCase() + filter.slice(1)}</label>
                </React.Fragment>
            ))}
            <div className="glass-glider2" />
          </div>
        </div>

        <div className="requests-list">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => {
              const user = usersData[request.uid];
              const status = request.status || 'pending';
              return (
                <div key={request.id} className={`request-card ${status.toLowerCase()}`}>
                  <div className="request-card-header">
                    <div className="service-info">
                      <span className="service-title">{request.serviceName}</span>
                      <span className="booked-on">Received: {new Date(request.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="header-right-section">
                      <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                    </div>
                  </div>

                  {user && (
                    <div className="user-info-row">
                      <div className="user-avatar-wrapper">
                        <span className="user-avatar-placeholder">{(user.firstName || 'U').charAt(0)}</span>
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.firstName} {user.lastName}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="request-details-grid">
                    <div className="detail-row">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{new Date(request.date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <FaRegClock className="detail-icon" />
                      <span>{request.timing}</span>
                    </div>
                    <div className="detail-row">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span>{request.address || 'Not Provided'}</span>
                    </div>
                    <div className="detail-row">
                        <FaRupeeSign className="detail-icon rupee-icon" />
                        <span>{request.price || 'N/A'}</span>
                    </div>
                  </div>
                    
                  <div className="description-row">
                    <span className="description-label">Description:</span>
                    <span className="request-description">{request.description || 'No description provided.'}</span>
                  </div>

                  {status === 'pending' && (
                    <div className="request-actions">
                      <button className="action-btn1 decline-btn" onClick={() => handleUpdateStatus(request.id, 'cancelled')}>
                        Decline
                      </button>
                      <button className="action-btn1 accept-btn" onClick={() => handleUpdateStatus(request.id, 'accepted')}>
                        Accept
                      </button>
                    </div>
                  )}

                   {status === 'accepted' && (
                    <div className="request-actions">
                      <button className="action-btn1 cancel-btn" onClick={() => handleUpdateStatus(request.id, 'cancelled')}>
                        Cancel
                      </button>
                      <button className="action-btn1 chat-btn">Chat</button>
                      <button className="action-btn1 complete-btn" onClick={() => handleUpdateStatus(request.id, 'completed')}>
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="no-results-message">
              <p>No service requests in the "{activeFilter}" category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceRequests;