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
import { ref, onValue, update, query, orderByChild, equalTo, get, child, set } from "firebase/database";
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

    setAllRequests(currentRequests =>
      currentRequests.map(r =>
        r.id === requestId ? { ...r, ...updates, displayStatus: status.toLowerCase() === 'completed' ? 'history' : status.toLowerCase() === 'cancelled' ? 'cancelled' : status.toLowerCase() } : r
      )
    );

    update(requestRef, updates)
      .catch(error => console.error(`Failed to update status to ${status}:`, error));
  };
  
  const handleChat = async (request) => {
    if (!currentTechnician || !request.uid) return;
    
    const technicianId = currentTechnician.uid;
    const customerId = request.uid;
    const chatId = [technicianId, customerId].sort().join('_');

    const chatRef = ref(database, `userChats/${technicianId}/${customerId}`);
    const chatSnap = await get(chatRef);

    if (!chatSnap.exists()) {
      const customer = usersData[customerId];
      const technicianName = currentTechnician.displayName || `${currentTechnician.firstName || ''} ${currentTechnician.lastName || ''}`.trim() || 'Technician';

      const chatMetadata = {
        chatId: chatId,
        lastMessage: "Chat started",
        lastMessageTime: Date.now(),
        unreadCount: 0,
      };

      const updates = {};
      updates[`/userChats/${technicianId}/${customerId}`] = { ...chatMetadata, name: `${customer.firstName} ${customer.lastName}` };
      updates[`/userChats/${customerId}/${technicianId}`] = { ...chatMetadata, name: technicianName };
      
      await update(ref(database), updates);
    }
    
    navigate(`/chat/${chatId}`);
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
              const fullAddress = user ? 
                `${user.address || ''}, ${user.city || ''}, ${user.state || ''} - ${user.zipCode || ''}`.trim() : 
                'Address not available';
              
              // --- UPDATED LOGIC FOR BUTTON ENABLING & HOVER TEXT ---
              let serviceStartTime = null;
              const now = new Date();
              let isChatDisabled = true;
              let isCompleteDisabled = true;
              let chatTitle = 'Chat is available 1 hour before the service starts.';
              let completeTitle = 'Completion can be marked after the service starts.';

              if (request.date && request.timing) {
                const startTimeStr = request.timing.split(' - ')[0];
                const fullDateTimeStr = `${request.date} ${startTimeStr}`;
                serviceStartTime = new Date(fullDateTimeStr);
                
                if (!isNaN(serviceStartTime.valueOf())) {
                    const chatActivationTime = new Date(serviceStartTime.getTime() - 60 * 60 * 1000); // 1 hour before
                    
                    isChatDisabled = now < chatActivationTime;
                    isCompleteDisabled = now < serviceStartTime;
                    
                    const chatTimeFormatted = chatActivationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const serviceTimeFormatted = serviceStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    chatTitle = isChatDisabled 
                        ? `Chat will be available 1 hour before service (from ${chatTimeFormatted})` 
                        : 'Click to chat with the customer';
                    
                    completeTitle = isCompleteDisabled 
                        ? `This can be marked complete after the service begins (at ${serviceTimeFormatted})` 
                        : 'Click to mark this service as completed';
                }
              }
              // --- END OF UPDATED LOGIC ---

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
                    <div className="detail-row full-address-row">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span className="full-address">{fullAddress}</span>
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
                    <div className="request-actions accepted-actions">
                      <button className="action-btn1 decline-btn" onClick={() => handleUpdateStatus(request.id, 'cancelled')}>
                        Cancel
                      </button>
                      <button 
                        className="action-btn1 chat-btn" 
                        onClick={() => handleChat(request)}
                        disabled={isChatDisabled}
                        title={chatTitle}
                      >
                        Chat
                      </button>
                      <button 
                        className="action-btn1 complete-btn" 
                        onClick={() => handleUpdateStatus(request.id, 'completed')}
                        disabled={isCompleteDisabled}
                        title={completeTitle}
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}

                  {status === 'completed' && (
                    <div className="completed-info">
                      <span className="completed-text">Completed on: {new Date(request.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {status === 'cancelled' && (
                    <div className="cancelled-info">
                      <span className="cancelled-text">Request was cancelled</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-requests-message">
              <p>No {activeFilter} found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceRequests;