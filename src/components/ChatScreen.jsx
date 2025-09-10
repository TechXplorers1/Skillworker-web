import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaArrowLeft, FaPaperPlane, FaStar, FaClock, FaMapMarkerAlt, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/ChatScreen.css';

const ChatScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Get technician/service details from navigation state or use defaults
  const { 
    technician, 
    service, 
    user, 
    bookingDetails 
  } = location.state || {};

  const chatTitle = technician?.name || user?.name || 'Professional';
  const chatSubtitle = technician?.service || service || 'Service Provider';
  const isTechnicianChat = !!technician;

  // Initial messages based on context
  useEffect(() => {
    let initialMessages = [];
    
    if (isTechnicianChat) {
      // Chat with technician
      initialMessages = [
        {
          id: 1,
          sender: 'technician',
          text: `Hello! I'm ${technician.name}, your ${technician.service} specialist. How can I help you today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    } else if (user) {
      // Chat with user (for technicians)
      initialMessages = [
        {
          id: 1,
          sender: 'user',
          text: `Hi! I need help with my ${service || 'service request'}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    } else {
      // Default chat
      initialMessages = [
        {
          id: 1,
          sender: 'system',
          text: 'Start a conversation about your service needs.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }
    
    setMessages(initialMessages);
  }, [technician, user, isTechnicianChat, service]);

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
      sender: isTechnicianChat ? 'user' : 'technician',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Simulate response after a delay
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        sender: isTechnicianChat ? 'technician' : 'user',
        text: isTechnicianChat 
          ? 'Thanks for your message. I\'ll get back to you shortly.' 
          : 'Thank you for reaching out. I appreciate your assistance.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  return (
    <div className="chat-screen-container">
      <Header />
      
      <div className="chat-main-content">

        <div className="chat-layout">
          {/* Left Column - Chat */}
          <div className="chat-column">
            <div className="chat-header">
              <div className="technician-info">
                <div className="tech-avatar">
                  {chatTitle.charAt(0).toUpperCase()}
                </div>
                <div className="tech-details">
                  <h3>{chatTitle}</h3>
                  <div className="online-status">
                    <div className="status-dot"></div>
                    <span>Online</span>
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
              <h3>{isTechnicianChat ? 'Service Details' : 'Request Details'}</h3>
              <div className="service-info">
                {bookingDetails && (
                  <>
                    <div className="info-row">
                      <span className="label">Service Type:</span>
                      <span className="value"><strong>{bookingDetails.service || chatSubtitle}</strong></span>
                    </div>
                    {bookingDetails.date && (
                      <div className="info-row">
                        <span className="label">Scheduled:</span>
                        <span className="value">{bookingDetails.date}</span>
                      </div>
                    )}
                    {bookingDetails.time && (
                      <div className="info-row">
                        <span className="label">Timing:</span>
                        <span className="value">{bookingDetails.time}</span>
                      </div>
                    )}
                    {bookingDetails.location && (
                      <div className="info-row">
                        <span className="label">Location:</span>
                        <span className="value">{bookingDetails.location}</span>
                      </div>
                    )}
                    {bookingDetails.price && (
                      <div className="info-row">
                        <span className="label">Price:</span>
                        <span className="value">₹{bookingDetails.price}</span>
                      </div>
                    )}
                  </>
                )}
                
                {!bookingDetails && (
                  <>
                    <div className="info-row">
                      <span className="label">Service Type:</span>
                      <span className="value"><strong>{chatSubtitle}</strong></span>
                    </div>
                    <div className="info-row">
                      <span className="label">Status:</span>
                      <span className="value">Active</span>
                    </div>
                  </>
                )}
              </div>
              
              {isTechnicianChat && technician && (
                <div className="technician-qualifications">
                  <h4>Technician Info</h4>
                  <ul>
                    <li>Licensed & Insured</li>
                    <li>Background Verified</li>
                    <li>{technician.experience || '5+ years'} Experience</li>
                    {technician.rating && (
                      <li>
                        <FaStar style={{color: '#fbbf24', marginRight: '5px'}} /> 
                        {technician.rating} Rating
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ChatScreen;