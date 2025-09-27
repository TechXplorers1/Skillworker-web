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
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Validate chatId on component mount
  useEffect(() => {
    if (!chatId) {
      setError("Invalid chat ID");
      setLoading(false);
      return;
    }
    
    if (typeof chatId !== 'string' || !chatId.includes('_')) {
      setError("Invalid chat format");
      setLoading(false);
      return;
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId || error) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      setCurrentUser(user);
      setLoading(true);
      setError(null);

      try {
        // Fetch current user's full profile data
        const currentUserRef = ref(database, `users/${user.uid}`);
        const currentUserSnapshot = await get(currentUserRef);
        if (currentUserSnapshot.exists()) {
          setCurrentUserData(currentUserSnapshot.val());
        }

        // Extract partner ID from chatId - with better validation
        console.log("Chat ID:", chatId);
        const userIds = chatId.split('_');
        console.log("User IDs from chatId:", userIds);
        
        if (userIds.length !== 2) {
          throw new Error("Invalid chat ID format. Expected 2 user IDs separated by underscore.");
        }
        
        const partnerId = userIds.find(id => id !== user.uid);
        console.log("Current User ID:", user.uid);
        console.log("Partner ID:", partnerId);

        if (!partnerId) {
          throw new Error("Could not determine the chat partner from the chatId.");
        }

        // Fetch partner data
        const partnerRef = ref(database, `users/${partnerId}`);
        const partnerSnapshot = await get(partnerRef);
        if (partnerSnapshot.exists()) {
          setChatPartner({ 
            ...partnerSnapshot.val(), 
            uid: partnerId 
          });
        } else {
          throw new Error("Partner data not found in database.");
        }

        // Clear unread messages for current user
        const userChatMetadataRef = ref(database, `userChats/${user.uid}/${partnerId}`);
        await update(userChatMetadataRef, { unreadCount: 0 });

        // Listen for messages - try different database structures
        const chatMessagesRef = ref(database, `chats/${chatId}/messages`);
        
        const unsubscribeChat = onValue(chatMessagesRef, (snapshot) => {
          const chatData = snapshot.val();
          console.log("Chat data received:", chatData);
          
          if (chatData) {
            const loadedMessages = Object.entries(chatData).map(([key, msg]) => ({
              id: key,
              ...msg
            }));
            
            // Sort by timestamp
            loadedMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            setMessages(loadedMessages);
            console.log("Loaded messages:", loadedMessages);
          } else {
            setMessages([]);
            console.log("No messages found in chat");
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to messages:", error);
          setError("Failed to load messages");
          setLoading(false);
        });

        return () => unsubscribeChat();
      } catch (error) {
        console.error("Error loading chat:", error);
        setError(error.message);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [chatId, navigate, error]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '' || !currentUser || !chatPartner || !currentUserData) {
      console.log("Cannot send message - missing requirements");
      return;
    }

    if (!chatId) {
      setError("No chat ID available");
      return;
    }

    const senderId = currentUser.uid;
    const receiverId = chatPartner.uid;
    
    const newMessageObj = {
      senderId: senderId,
      message: newMessage.trim(),
      timestamp: serverTimestamp()
    };
    
    console.log("Sending message:", newMessageObj);
    
    try {
      const updates = {};
      
      // Push message to chats structure
      const messageRef = push(ref(database, `chats/${chatId}/messages`));
      updates[`chats/${chatId}/messages/${messageRef.key}`] = newMessageObj;
      
      // Update user chats metadata
      const senderName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'User';
      const partnerName = `${chatPartner.firstName || ''} ${chatPartner.lastName || ''}`.trim() || 'Partner';

      // For sender
      updates[`userChats/${senderId}/${receiverId}/lastMessage`] = newMessage.trim();
      updates[`userChats/${senderId}/${receiverId}/lastMessageTime`] = serverTimestamp();
      updates[`userChats/${senderId}/${receiverId}/name`] = partnerName;
      updates[`userChats/${senderId}/${receiverId}/chatId`] = chatId;

      // For receiver
      updates[`userChats/${receiverId}/${senderId}/lastMessage`] = newMessage.trim();
      updates[`userChats/${receiverId}/${senderId}/lastMessageTime`] = serverTimestamp();
      updates[`userChats/${receiverId}/${senderId}/name`] = senderName;
      updates[`userChats/${receiverId}/${senderId}/chatId`] = chatId;
      updates[`userChats/${receiverId}/${senderId}/unreadCount`] = increment(1);

      console.log("Database updates:", updates);
      
      await update(ref(database), updates);
      setNewMessage('');
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message: " + error.message);
    }
  };

  const getChatTitle = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error';
    if (chatPartner) {
      const name = `${chatPartner.firstName || ''} ${chatPartner.lastName || ''}`.trim();
      return name || 'Unknown User';
    }
    return 'Chat Partner';
  };

  if (error) {
    return (
      <div className="chat-screen-container">
        <Header />
        <div className="error-container">
          <h3>Error Loading Chat</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/message-box')} className="back-button">
            Back to Messages
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="chat-screen-container">
        <Header />
        <div className="loading-container">Loading chat...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="chat-screen-container">
      <Header />
      <div className="chat-main-content">
        <div className="chat-layout">
          <div className="chat-column">
            <div className="chat-header">
              <div className="technician-info">
                <div className="tech-avatar">
                  {getChatTitle().charAt(0).toUpperCase()}
                </div>
                <div className="tech-details">
                  <h3>{getChatTitle()}</h3>
                  <div className="online-status">
                    <div className="status-dot"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`message ${message.senderId === currentUser?.uid ? 'user-message' : 'technician-message'}`}
                  >
                    <div className="message-content">
                      <p>{message.message}</p>
                      <span className="message-time">
                        {message.timestamp 
                          ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Sending...'
                        }
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
                disabled={!chatPartner}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!chatPartner || newMessage.trim() === ''}
              >
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
                    <span className="value"><strong>{getChatTitle()}</strong></span>
                  </div>
                  <div className="info-row">
                    <span className="label">Role:</span>
                    <span className="value">{chatPartner.role || 'User'}</span>
                  </div>
                  {/* <div className="info-row">
                    <span className="label">Chat ID:</span>
                    <span className="value" style={{fontSize: '12px'}}>{chatId}</span>
                  </div> */}
                </div>
                
                {chatPartner.role === 'technician' && chatPartner.averageRating && (
                  <div className="technician-qualifications">
                    <h4>Technician Info</h4>
                    <ul>
                      <li>Licensed & Insured</li>
                      <li>Background Verified</li>
                      <li>
                        <FaStar style={{color: '#fbbf24', marginRight: '5px'}} /> 
                        {`${chatPartner.averageRating.toFixed(1)} Rating`}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
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