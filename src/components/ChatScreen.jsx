import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaArrowLeft, FaPaperPlane, FaStar, FaClock, FaMapMarkerAlt, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/ChatScreen.css';

// Mock technician data
const technicianData = {
  tech1: {
    id: 'tech1',
    name: 'John Davidson',
    service: 'Plumbing',
    rating: '4.8',
    reviews: '127',
    experience: '5+ years',
    distance: '2.3 km',
    price: 45,
    image: '/profile1.png',
    status: 'Online'
  },
  tech2: {
    id: 'tech2',
    name: 'TECHY 2',
    service: 'Plumbing',
    rating: '4.9',
    reviews: '89',
    experience: '3+ years',
    distance: '1.8 km',
    price: 55,
    image: '/profile2.png',
    status: 'Online'
  },
  electro1: {
    id: 'electro1',
    name: 'ELECTRO 1',
    service: 'Electrical',
    rating: '4.8',
    reviews: '102',
    experience: '6+ years',
    distance: '1.6 km',
    price: 50,
    image: '/profile1.png',
    status: 'Online'
  },
};

const ChatScreen = () => {
  const { serviceName, technicianId } = useParams();
  const navigate = useNavigate();
  const [hasBooking, setHasBooking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const technician = technicianData[technicianId] || {
    id: technicianId,
    name: 'Professional Technician',
    service: serviceName,
    rating: '4.5',
    reviews: '50',
    experience: '5+ years',
    distance: '2.0 km',
    price: 45,
    image: '/profile1.png',
    status: 'Online'
  };

  // Check if user has a booking with this technician
  useEffect(() => {
    // In a real app, this would check your database/API
    // For demo purposes, we'll check localStorage for a booking flag
    const bookingKey = `booking_${technicianId}`;
    const hasActiveBooking = localStorage.getItem(bookingKey) === 'true';
    
    setHasBooking(hasActiveBooking);
    
    if (!hasActiveBooking) {
      // If no booking, redirect to booking page after a delay
      const timer = setTimeout(() => {
        navigate(`/booking/${serviceName}/${technicianId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [technicianId, serviceName, navigate]);

  // Initial messages - only load if user has booking
  useEffect(() => {
    if (hasBooking) {
      setMessages([
        {
          id: 1,
          sender: 'technician',
          text: 'Good morning! I\'m on my way to your location. I should arrive in about 15 minutes. Is that okay?',
          time: '9:39 AM'
        },
        {
          id: 2,
          sender: 'user',
          text: 'Yes, that works perfectly. I\'ll be waiting. Do you need any specific information about the plumbing issue?',
          time: '9:42 AM'
        },
        {
          id: 3,
          sender: 'technician',
          text: 'Could you describe the problem? Is it a leak, blockage, or something else?',
          time: '9:43 AM'
        }
      ]);
    }
  }, [technicianId, hasBooking]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Simulate technician response after a delay
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        sender: 'technician',
        text: 'Thanks for the information. I\'ll assess the situation when I arrive.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookNow = () => {
    navigate(`/booking/${serviceName}/${technicianId}`);
  };

  const handleRequestQuote = () => {
    const newMsg = {
      id: messages.length + 1,
      sender: 'system',
      text: 'Quote request has been sent to the technician.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
  };

  // Show loading/redirect message if no booking
  if (!hasBooking) {
    return (
      <div className="chat-screen-container">
        <Header />
        <div className="no-booking-message">
          <FaExclamationTriangle className="warning-icon" />
          <h2>Booking Required</h2>
          <p>You need to book this technician before you can start a conversation.</p>
          <p>Redirecting to booking page...</p>
          <button className="redirect-btn" onClick={() => navigate(`/booking/${serviceName}/${technicianId}`)}>
            Go to Booking Now
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="chat-screen-container">
      <Header />
      
      <div className="chat-main-content">
        <div className="back-nav">
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="chat-layout">
          {/* Left Column - Chat */}
          <div className="chat-column">
            <div className="chat-header">
              <div className="technician-info">
                <img src={technician.image} alt={technician.name} className="tech-avatar" />
                <div className="tech-details">
                  <h3>{technician.name}</h3>
                  <div className="online-status">
                    <div className="status-dot"></div>
                    <span>{technician.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'user-message' : message.sender === 'technician' ? 'technician-message' : 'system-message'}`}
                >
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">{message.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
              />
              <button type="submit" className="send-button">
                <FaPaperPlane />
              </button>
            </form>
          </div>

          {/* Right Column - Service Details */}
          <div className="details-column">
            <div className="service-details-card">
              <h3>Service Details</h3>
              <div className="service-info">
                <div className="info-row">
                  <span className="label">Service Type:</span>
                  <span className="value"><strong>{technician.service} Repair</strong></span>
                </div>
                <div className="info-row">
                  <span className="label">Scheduled:</span>
                  <span className="value">Today, 2:00 PM</span>
                </div>
                <div className="info-row">
                  <span className="label">Estimated Duration:</span>
                  <span className="value">2-3 hours</span>
                </div>
                <div className="info-row">
                  <span className="label">Rate:</span>
                  <span className="value">${technician.price}/hour</span>
                </div>
              </div>
              
              <div className="technician-qualifications">
                <h4>Technician Info</h4>
                <ul>
                  <li>Licensed & Insured</li>
                  <li>Background Verified</li>
                  <li>{technician.experience} Experience</li>
                </ul>
              </div>
              
              <div className="quick-actions">
                <button className="quote-btn" onClick={handleRequestQuote}>Request Quote</button>
                <button className="book-btn" onClick={handleBookNow}>Confirm Appointment</button>
              </div>
            </div>

            <div className="search-section">
              <div className="search-input">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search" />
              </div>
            </div>

            <div className="date-display">
              <span>01/09/6</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ChatScreen;