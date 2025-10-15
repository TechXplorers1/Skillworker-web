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
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [disableReason, setDisableReason] = useState('');
  const messagesEndRef = useRef(null);

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
        // Fetch current user's profile
        const currentUserRef = ref(database, `users/${user.uid}`);
        const currentUserSnapshot = await get(currentUserRef);
        if (currentUserSnapshot.exists()) setCurrentUserData(currentUserSnapshot.val());

        const userIds = chatId.split('_');
        if (userIds.length !== 2) throw new Error("Invalid chat ID format");

        const partnerId = userIds.find(id => id !== user.uid);
        if (!partnerId) throw new Error("Could not determine chat partner.");

        // Fetch partner data
        const partnerRef = ref(database, `users/${partnerId}`);
        const partnerSnapshot = await get(partnerRef);
        if (partnerSnapshot.exists()) {
          setChatPartner({ ...partnerSnapshot.val(), uid: partnerId });
        } else throw new Error("Partner data not found.");

        // Check status of related bookings
        await checkServiceStatus(user.uid, partnerId);

        // Reset unread count
        const userChatMetadataRef = ref(database, `userChats/${user.uid}/${partnerId}`);
        await update(userChatMetadataRef, { unreadCount: 0 });

        // Listen for messages
        const chatMessagesRef = ref(database, `chats/${chatId}/messages`);
        const unsubscribeChat = onValue(chatMessagesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const msgs = Object.entries(data).map(([key, msg]) => ({
              id: key,
              ...msg,
            }));
            msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            setMessages(msgs);
          } else setMessages([]);
          setLoading(false);
        }, (err) => {
          setError("Failed to load messages");
          setLoading(false);
        });

        return () => unsubscribeChat();
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [chatId, navigate, error]);

  const checkServiceStatus = async (currentUserId, partnerId) => {
  try {
    const bookingsRef = ref(database, 'bookings');
    const snapshot = await get(bookingsRef);

    if (snapshot.exists()) {
      const bookings = snapshot.val();
      const relevant = Object.values(bookings).filter(b =>
        (b.uid === currentUserId && b.technicianId === partnerId) ||
        (b.uid === partnerId && b.technicianId === currentUserId)
      );

      if (relevant.length > 0) {
        // Sort latest booking by timestamp or createdAt
        const latestBooking = relevant.sort((a, b) => {
          const timeA = a.timestamp || a.createdAt || 0;
          const timeB = b.timestamp || b.createdAt || 0;
          return timeB - timeA;
        })[0];

        const status = latestBooking.status?.toLowerCase() || '';

        if (status.includes('completed')) {
          setIsChatDisabled(true);
          setServiceStatus('completed');
          setDisableReason('Service Completed');
        } 
        else if (
          status.includes('cancel') ||  // catches 'canceled', 'cancelled', 'userCanceled', 'technicianCanceled'
          status === 'rejected' ||
          status === 'declined'
        ) {
          setIsChatDisabled(true);
          setServiceStatus('canceled');
          setDisableReason('Service Cancelled');
        } 
        else {
          setIsChatDisabled(false);
          setServiceStatus('active');
          setDisableReason('');
        }
      } else {
        setIsChatDisabled(true);
        setServiceStatus('none');
        setDisableReason('No active booking found');
      }
    }
  } catch (err) {
    console.error("Error checking service status:", err);
    setIsChatDisabled(false);
  }
};

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isChatDisabled) return;

    if (newMessage.trim() === '' || !currentUser || !chatPartner || !currentUserData) return;

    const senderId = currentUser.uid;
    const receiverId = chatPartner.uid;

    const newMessageObj = {
      senderId,
      message: newMessage.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      const updates = {};
      const messageRef = push(ref(database, `chats/${chatId}/messages`));
      updates[`chats/${chatId}/messages/${messageRef.key}`] = newMessageObj;

      const senderName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'User';
      const partnerName = `${chatPartner.firstName || ''} ${chatPartner.lastName || ''}`.trim() || 'Partner';

      updates[`userChats/${senderId}/${receiverId}`] = {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        name: partnerName,
        chatId,
      };
      updates[`userChats/${receiverId}/${senderId}`] = {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        name: senderName,
        chatId,
        unreadCount: increment(1),
      };

      await update(ref(database), updates);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message: " + err.message);
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
                <div className="tech-avatar">{getChatTitle().charAt(0).toUpperCase()}</div>
                <div className="tech-details">
                  <h3>{getChatTitle()}</h3>
                  <div className="online-status">
                    <div className="status-dot"></div>
                    <span>Online</span>
                    {isChatDisabled && (
                      <span style={{ marginLeft: '10px', color: '#d32f2f', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        • Chat Disabled ({disableReason})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.senderId === currentUser?.uid ? 'user-message' : 'technician-message'}`}
                  >
                    <div className="message-content">
                      <p>{msg.message}</p>
                      <span className="message-time">
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Sending...'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-messages"><p>No messages yet. Start the conversation!</p></div>
              )}
              {isChatDisabled && (
                <div className="system-message">
                  <div className="message-content">
                    <p>Chat has been disabled because the service was {serviceStatus === 'cancelled' ? 'cancelled' : 'completed'}.</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder={isChatDisabled ? `Chat disabled - ${disableReason}` : "Type your message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
                disabled={!chatPartner || isChatDisabled}
              />
              <button
                type="submit"
                className="send-button"
                disabled={!chatPartner || newMessage.trim() === '' || isChatDisabled}
                title={isChatDisabled ? `Chat disabled - ${disableReason}` : "Send message"}
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
                  <div className="info-row"><span className="label">Name:</span><span className="value"><strong>{getChatTitle()}</strong></span></div>
                  <div className="info-row"><span className="label">Role:</span><span className="value">{chatPartner.role || 'User'}</span></div>
                  <div className="info-row">
                    <span className="label">Chat Status:</span>
                    <span className="value" style={{ color: isChatDisabled ? '#d32f2f' : '#22c55e', fontWeight: 'bold' }}>
                      {isChatDisabled ? `Disabled (${disableReason})` : 'Active'}
                    </span>
                  </div>
                </div>

                {chatPartner.role === 'technician' && chatPartner.averageRating && (
                  <div className="technician-qualifications">
                    <h4>Technician Info</h4>
                    <ul>
                      <li>Licensed & Insured</li>
                      <li>Background Verified</li>
                      <li><FaStar style={{ color: '#fbbf24', marginRight: '5px' }} />{`${chatPartner.averageRating.toFixed(1)} Rating`}</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="service-details-card"><h3>Partner Info</h3><p>Could not load user details.</p></div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatScreen;
