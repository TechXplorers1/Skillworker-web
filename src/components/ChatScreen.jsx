import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaPaperPlane, FaStar } from 'react-icons/fa';
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, push, serverTimestamp, get, update, increment } from "firebase/database";
import { auth, database } from "../firebase";
import '../styles/ChatScreen.css';

const ChatScreen = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);

      // Fetch current user's full profile data
      const currentUserRef = ref(database, `users/${user.uid}`);
      get(currentUserRef).then(snapshot => {
        if(snapshot.exists()) {
          setCurrentUserData(snapshot.val());
        }
      });

      // 1. Find the partner's ID from the userChats node
      const userChatsRef = ref(database, `userChats/${user.uid}`);
      get(userChatsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const chats = snapshot.val();
          const chatPartnerId = Object.keys(chats).find(
            partnerId => chats[partnerId].chatId === chatId
          );

          if (chatPartnerId) {
            // 2. Fetch the chat partner's details using the found ID
            const partnerRef = ref(database, `users/${chatPartnerId}`);
            onValue(partnerRef, (partnerSnapshot) => {
              if (partnerSnapshot.exists()) {
                setChatPartner(partnerSnapshot.val());
              }
              // Data is loaded, whether partner exists or not
              setLoading(false);
            });
          } else {
            // FIX: If no partner is found for this chat, stop loading
            setLoading(false);
          }
        } else {
            // FIX: If the user has no chats, stop loading
            setLoading(false);
        }
      });
      
      // 3. Set up a listener for new messages
      const chatRef = ref(database, `chat/${chatId}`);
      const unsubscribeChat = onValue(chatRef, (snapshot) => {
          const chatData = snapshot.val();
          if (chatData) {
              const loadedMessages = Object.values(chatData).map((msg, index) => ({
                  id: Object.keys(chatData)[index],
                  ...msg
              }));
              loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
              setMessages(loadedMessages);
          } else {
              setMessages([]);
          }
      });

      return () => unsubscribeChat();
    });

    return () => unsubscribeAuth();
  }, [chatId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser || !chatPartner || !currentUserData) return;

    const senderId = currentUser.uid;
    const receiverId = chatPartner.uid;
    
    const newMessageObj = {
        senderId: senderId,
        message: newMessage,
        timestamp: serverTimestamp()
    };
    
    const updates = {};
    const messageKey = push(ref(database, `chat/${chatId}`)).key;
    updates[`/chat/${chatId}/${messageKey}`] = newMessageObj;
    
    const senderName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim();
    const partnerName = `${chatPartner.firstName || ''} ${chatPartner.lastName || ''}`.trim();

    updates[`/userChats/${senderId}/${receiverId}/lastMessage`] = newMessage;
    updates[`/userChats/${senderId}/${receiverId}/lastMessageTime`] = serverTimestamp();
    updates[`/userChats/${senderId}/${receiverId}/name`] = partnerName;

    updates[`/userChats/${receiverId}/${senderId}/lastMessage`] = newMessage;
    updates[`/userChats/${receiverId}/${senderId}/lastMessageTime`] = serverTimestamp();
    updates[`/userChats/${receiverId}/${senderId}/name`] = senderName;
    updates[`/userChats/${receiverId}/${senderId}/unreadCount`] = increment(1);

    await update(ref(database), updates);

    setNewMessage('');
  };

  // FIX: More robust function to determine the chat title based on loading and data state
  const getChatTitle = () => {
    if (loading) {
      return 'Loading User...';
    }
    if (chatPartner) {
      const name = `${chatPartner.firstName || ''} ${chatPartner.lastName || ''}`.trim();
      return name || 'Unknown User';
    }
    return 'Unknown User';
  };

  const chatTitle = getChatTitle();

  return (
    <div className="chat-screen-container">
      <Header />
      <div className="chat-main-content">
        <div className="chat-layout">
          <div className="chat-column">
            <div className="chat-header">
              <div className="technician-info">
                  <div className="tech-avatar">
                    {chatTitle.charAt(0).toUpperCase()}
                  </div>
                  <div className="tech-details">
                    <h3>{chatTitle}</h3>
                    {chatPartner && (
                      <div className="online-status">
                        <div className="status-dot"></div>
                        <span>Online</span>
                      </div>
                    )}
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
                    <span className="message-time">
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
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

          <div className="details-column">
            {chatPartner ? (
              <div className="service-details-card">
              <h3>Partner Info</h3>
              <div className="service-info">
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value"><strong>{chatTitle}</strong></span>
                  </div>
                   <div className="info-row">
                    <span className="label">Role:</span>
                    <span className="value">{chatPartner.role || 'User'}</span>
                  </div>
              </div>
              
              {chatPartner.role === 'technician' && (
                <div className="technician-qualifications">
                  <h4>Technician Info</h4>
                  <ul>
                    <li>Licensed & Insured</li>
                    <li>Background Verified</li>
                    {chatPartner.averageRating && (
                      <li>
                        <FaStar style={{color: '#fbbf24', marginRight: '5px'}} /> 
                        {`${chatPartner.averageRating.toFixed(1)} Rating`}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            ) : !loading && (
              <div className="service-details-card">
                <h3>Partner Info</h3>
                <p>Could not load user details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatScreen;