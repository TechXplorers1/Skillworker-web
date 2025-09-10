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
import '../styles/ServiceRequests.css';

const ServiceRequests = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('Requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedDate, setSelectedDate] = useState('');
  const [requests, setRequests] = useState([]);

  // Initialize requests data
  useEffect(() => {
    const initialRequests = [
      {
        id: 'req1',
        service: 'Electrician',
        userName: 'chaveen reddy',
        userAddress: 'N/A',
        userRating: '4.8',
        userAvatar: '/path/to/user1-avatar.png',
        status: 'Requests',
        bookedOn: '10/09/2025 4:03 PM',
        date: '2025-09-10',
        dateObj: new Date('2025-09-10'),
        time: 'Afternoon (12:00 PM - 3:00 PM)',
        duration: '2-3 hours',
        location: 'Bengaluru',
        price: 1350,
        description: 'AC not cooling properly',
        requestId: '#48'
      },
      {
        id: 'req2',
        service: 'Plumber',
        userName: 'rajesh kumar',
        userAddress: 'HSR Layout, Bengaluru',
        userRating: '4.5',
        userAvatar: '/path/to/user2-avatar.png',
        status: 'Accepted',
        bookedOn: '10/09/2025 3:45 PM',
        date: '2025-09-11',
        dateObj: new Date('2025-09-11'),
        time: 'Morning (9:00 AM - 12:00 PM)',
        duration: '1-2 hours',
        location: 'Bengaluru',
        price: 850,
        description: 'Pipe leakage in kitchen',
        requestId: '#49'
      },
      {
        id: 'req3',
        service: 'Electrician',
        userName: 'sneha patel',
        userAddress: 'Indiranagar, Bengaluru',
        userRating: '4.9',
        userAvatar: '/path/to/user3-avatar.png',
        status: 'History',
        bookedOn: '09/09/2025 2:30 PM',
        date: '2025-09-09',
        dateObj: new Date('2025-09-09'),
        time: 'Evening (4:00 PM - 7:00 PM)',
        duration: '2 hours',
        location: 'Bengaluru',
        price: 1200,
        description: 'Switch board installation',
        requestId: '#47'
      },
      {
        id: 'req4',
        service: 'Carpenter',
        userName: 'mohan das',
        userAddress: 'Whitefield, Bengaluru',
        userRating: '4.7',
        userAvatar: '/path/to/user4-avatar.png',
        status: 'Canceled',
        bookedOn: '08/09/2025 11:20 AM',
        date: '2025-09-08',
        dateObj: new Date('2025-09-08'),
        time: 'Afternoon (12:00 PM - 3:00 PM)',
        duration: '3-4 hours',
        location: 'Bengaluru',
        price: 2000,
        description: 'Door repair needed',
        requestId: '#46'
      },
      {
        id: 'req5',
        service: 'Electrician',
        userName: 'priya sharma',
        userAddress: 'Koramangala, Bengaluru',
        userRating: '4.6',
        userAvatar: '/path/to/user5-avatar.png',
        status: 'Requests',
        bookedOn: '10/09/2025 10:15 AM',
        date: '2025-09-12',
        dateObj: new Date('2025-09-12'),
        time: 'Afternoon (12:00 PM - 3:00 PM)',
        duration: '2 hours',
        location: 'Bengaluru',
        price: 1500,
        description: 'Fan installation',
        requestId: '#45'
      },
    ];
    setRequests(initialRequests);
  }, []);

  const serviceTypes = ['All Services', ...new Set(requests.map(request => request.service))];

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = activeFilter === 'All' || request.status === activeFilter;
    const matchesService = selectedService === 'All Services' || request.service === selectedService;
    const matchesDate = !selectedDate || request.dateObj.toDateString() === new Date(selectedDate).toDateString();
    const matchesSearch = searchTerm === '' ||
      request.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesService && matchesDate && matchesSearch;
  });

  const handleAcceptRequest = (requestId) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId ? { ...request, status: 'Accepted' } : request
      )
    );
  };

  const handleDeclineRequest = (requestId) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId ? { ...request, status: 'Canceled' } : request
      )
    );
  };

  const handleCancelRequest = (requestId) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId ? { ...request, status: 'Canceled' } : request
      )
    );
  };

  const handleCompleteRequest = (requestId) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId ? { ...request, status: 'History' } : request
      )
    );
  };

 const handleChatClick = (request) => {
    navigate('/chat/request', { 
      state: { 
        user: {
          name: request.userName,
          address: request.userAddress,
          rating: request.userRating
        },
        service: request.service,
        bookingDetails: {
          service: request.service,
          date: request.date,
          time: request.time,
          location: request.location,
          price: request.price,
          description: request.description
        }
      } 
    });
  };
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
            <input
              type="radio"
              name="plan"
              id="requests"
              checked={activeFilter === 'Requests'}
              onChange={() => setActiveFilter('Requests')}
            />
            <label htmlFor="requests">Requests</label>
            <input
              type="radio"
              name="plan"
              id="accepted"
              checked={activeFilter === 'Accepted'}
              onChange={() => setActiveFilter('Accepted')}
            />
            <label htmlFor="accepted">Accepted</label>
            <input
              type="radio"
              name="plan"
              id="canceled"
              checked={activeFilter === 'Canceled'}
              onChange={() => setActiveFilter('Canceled')}
            />
            <label htmlFor="canceled">Canceled</label>
            <input
              type="radio"
              name="plan"
              id="history"
              checked={activeFilter === 'History'}
              onChange={() => setActiveFilter('History')}
            />
            <label htmlFor="history">History</label>
            <div className="glass-glider" />
          </div>
        </div>

        <div className="requests-list">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div key={request.id} className={`request-card ${request.status.toLowerCase()}`}>
                <div className="request-card-header">
                  <div className="service-info">
                    <span className="service-title">{request.service}</span>
                    <span className="booked-on">Booked on: {request.bookedOn}</span>
                  </div>
                  <div className="header-right-section">
                    <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
                  </div>
                </div>

                <div className="user-info-row">
                  <div className="user-avatar-wrapper">
                      <span className="user-avatar-placeholder">
                        {request.userName.charAt(0)}
                      </span>
                  </div>
                  <div className="user-details">
                    <span className="user-name">User: {request.userName}</span>
                    <span className="user-address">Address: {request.userAddress}</span>
                    <div className="user-rating">
                      <FaStar className="star-icon" />
                      <span>{request.userRating}</span>
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
                    <span>Timings: {request.time}</span>
                  </div>
                  <div className="detail-row">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{request.location}</span>
                  </div>
                  <div className="detail-row">
                    <FaRupeeSign className="detail-icon rupee-icon" />
                    <span>{request.price}</span>
                  </div>
                </div>
                  
                <div className="description-row">
                  <span className="description-label">Description:</span>
                  <span className="request-description">{request.description}</span>
                </div>

                {request.status === 'Requests' && (
                  <div className="request-actions">
                    <button 
                      className="action-btn decline-btn"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      Decline
                    </button>
                    <button 
                      className="action-btn accept-btn"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </button>
                  </div>
                )}

                 {request.status === 'Accepted' && (
                <div className="request-actions">
                  <button 
                    className="action-btn cancel-btn"
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="action-btn chat-btn"
                    onClick={() => handleChatClick(request)}
                  >
                    Chat
                  </button>
                  <button 
                    className="action-btn complete-btn"
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