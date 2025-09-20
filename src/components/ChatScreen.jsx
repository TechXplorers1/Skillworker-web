import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaArrowLeft, FaPaperPlane, FaStar, FaClock, FaMapMarkerAlt, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { auth, database } from "../firebase";
import '../styles/ChatScreen.css';

const ChatScreen = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUser, setChatUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setCurrentUser(user);
            
            // Determine the chat partner's UID from the chat ID and current user's UID
            const chatPartnerId = chatId.split('-').find(id => id !== user.uid);
            
            // Fetch chat partner's details
            const userRef = ref(database, `users/${chatPartnerId}`);
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    setChatUser(snapshot.val());
                }
            });

            // Fetch messages for the chat
            const chatRef = ref(database, `chat/${chatId}`);
            const unsubscribeChat = onValue(chatRef, (snapshot) => {
                const chatData = snapshot.val();
                if (chatData) {
                    const loadedMessages = Object.keys(chatData).map(key => ({
                        id: key,
                        ...chatData[key]
                    }));
                    setMessages(loadedMessages);
                } else {
                    setMessages([]);
                }
            });

            return () => unsubscribeChat();
        }
    });

    return () => unsubscribeAuth();
  }, [chatId]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    const chatRef = ref(database, `chat/${chatId}`);
    push(chatRef, {
        senderId: currentUser.uid,
        message: newMessage,
        timestamp: serverTimestamp()
    });

    setNewMessage('');
  };

  const chatTitle = chatUser ? `${chatUser.firstName} ${chatUser.lastName}` : 'User';
  const chatSubtitle = chatUser ? chatUser.role : 'N/A';
  const isTechnicianChat = chatUser?.role === 'technician';
  const bookingDetails = location.state?.bookingDetails || {};

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
                  className={`message ${message.senderId === currentUser?.uid ? 'user-message' : 'technician-message'}`}
                >
                  <div className="message-content">
                    <p>{message.message}</p>
                    <span className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
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
              
              {isTechnicianChat && chatUser && (
                <div className="technician-qualifications">
                  <h4>Technician Info</h4>
                  <ul>
                    <li>Licensed & Insured</li>
                    <li>Background Verified</li>
                    <li>{chatUser.yearsOfExperience || '5+ years'} Experience</li>
                    {chatUser.averageRating && (
                      <li>
                        <FaStar style={{color: '#fbbf24', marginRight: '5px'}} /> 
                        {chatUser.averageRating.toFixed(1)} Rating
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