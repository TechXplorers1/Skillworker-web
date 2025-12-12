import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaPaperPlane, FaStar, FaImage, FaTimes, FaCamera, FaStop } from 'react-icons/fa';
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, push, serverTimestamp, get, update, increment, query, orderByChild, equalTo, limitToLast } from "firebase/database";
import { auth, database, storage } from "../firebase";
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import '../styles/ChatScreen.css';

const ChatScreen = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [chatPartner, setChatPartner] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [disableReason, setDisableReason] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const canvasRef = useRef(null);

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
        const recentMessagesQuery = query(chatMessagesRef, limitToLast(100));
        const unsubscribeChat = onValue(recentMessagesQuery, (snapshot) => {
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

      // Optimization: Query both scenarios (User vs Tech, Tech vs User)
      // instead of downloading the entire bookings table.
      const asUserQuery = query(bookingsRef, orderByChild('uid'), equalTo(currentUserId));
      const asTechQuery = query(bookingsRef, orderByChild('technicianId'), equalTo(currentUserId));

      const [asUserSnap, asTechSnap] = await Promise.all([get(asUserQuery), get(asTechQuery)]);

      let relevant = [];

      if (asUserSnap.exists()) {
        const userBookings = Object.values(asUserSnap.val());
        relevant = [...relevant, ...userBookings.filter(b => b.technicianId === partnerId)];
      }

      if (asTechSnap.exists()) {
        const techBookings = Object.values(asTechSnap.val());
        relevant = [...relevant, ...techBookings.filter(b => b.uid === partnerId)];
      }

      if (relevant.length > 0) {
        // Filter out duplicates based on ID (though unlikely to overlap in this logic)
        const uniqueBookings = Array.from(new Map(relevant.map(item => [item.id || JSON.stringify(item), item])).values());

        const latestBooking = uniqueBookings.sort((a, b) => {
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
          status.includes('cancel') ||
          status === 'rejected' ||
          status === 'declined'
        ) {
          setIsChatDisabled(true);
          setServiceStatus('cancelled');
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
    } catch (err) {
      console.error("Error checking service status:", err);
      setIsChatDisabled(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Webcam functionality
  const startWebcam = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      setWebcamStream(stream);
      setShowWebcam(true);

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Could not access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setShowWebcam(false);
    setIsRecording(false);
  };

  const captureImage = () => {
    if (webcamVideoRef.current && canvasRef.current) {
      const video = webcamVideoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });

        setImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(blob));
        stopWebcam();
      }, 'image/jpeg', 0.8);
    }
  };

  const sendMessageToDatabase = async (messageData, lastMsgSummary) => {
    const senderId = currentUser.uid;
    const receiverId = chatPartner.uid;

    const updates = {};
    const messageRef = push(ref(database, `chats/${chatId}/messages`));
    updates[`chats/${chatId}/messages/${messageRef.key}`] = messageData;

    const senderName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'User';
    const partnerName = `${chatPartner.firstName || ''} ${chatPartner.lastName || ''}`.trim() || 'Partner';

    updates[`userChats/${senderId}/${receiverId}`] = {
      lastMessage: lastMsgSummary,
      lastMessageTime: serverTimestamp(),
      name: partnerName,
      chatId,
    };
    updates[`userChats/${receiverId}/${senderId}`] = {
      lastMessage: lastMsgSummary,
      lastMessageTime: serverTimestamp(),
      name: senderName,
      chatId,
      unreadCount: increment(1),
    };

    await update(ref(database), updates);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (isChatDisabled) {
      console.log('Chat is disabled');
      return;
    }

    if (isSending) {
      console.log('Already sending a message');
      return;
    }

    const textMessage = newMessage.trim();
    if (textMessage === '' && !imageFile) {
      console.log('No message content');
      return;
    }

    if (!currentUser || !chatPartner || !currentUserData) {
      console.log('Missing user data');
      return;
    }

    console.log('Starting to send message...');
    setIsSending(true);
    setError(null);

    let imageUrl = null;

    try {
      // Upload image first if exists
      if (imageFile) {
        console.log('Uploading image...');
        const imageExtension = imageFile.name.split('.').pop();
        const imagePath = `chat_images/${chatId}/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${imageExtension}`;
        const storageReference = storageRef(storage, imagePath);

        const uploadResult = await uploadBytes(storageReference, imageFile);
        console.log('Image uploaded, getting download URL...');
        imageUrl = await getDownloadURL(uploadResult.ref);
        console.log('Image URL:', imageUrl);
      }

      // Prepare message object
      const messageContent = textMessage || (imageUrl ? 'Image sent' : '');
      const newMessageObj = {
        senderId: currentUser.uid,
        message: messageContent,
        timestamp: serverTimestamp(),
        imageUrl: imageUrl,
      };

      const lastMsgSummary = imageUrl ? (textMessage || 'Image') : textMessage;

      console.log('Sending message to database...');
      await sendMessageToDatabase(newMessageObj, lastMsgSummary);
      console.log('Message sent successfully');

      // Clear form after successful send
      setNewMessage('');
      removeImage();

    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      setError(err.message || "Failed to send message");

      // Clean up on error
      if (imageFile) {
        removeImage();
      }
    } finally {
      console.log('Setting isSending to false');
      setIsSending(false);
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

  const renderMessageContent = (msg) => {
    return (
      <div className="message-content">
        {msg.imageUrl && (
          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="image-link">
            <img
              src={msg.imageUrl}
              alt="Uploaded by user"
              className="uploaded-image"
              onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
            />
          </a>
        )}
        {msg.message && msg.message !== 'Image sent' && <p>{msg.message}</p>}
        <span className="message-time">
          {msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Sending...'}
        </span>
      </div>
    );
  };

  // Clean up object URLs and webcam stream on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [imagePreviewUrl, webcamStream]);

  if (error && !loading) {
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
                    className={`message ${msg.senderId === currentUser?.uid ? 'user-message' : 'technician-message'} ${msg.imageUrl ? 'has-image' : ''}`}
                  >
                    {renderMessageContent(msg)}
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

            {/* Webcam Modal */}
            {showWebcam && (
              <div className="webcam-modal">
                <div className="webcam-content">
                  <div className="webcam-header">
                    <h3>Take a Photo</h3>
                    <button
                      type="button"
                      className="close-webcam-btn"
                      onClick={stopWebcam}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <video
                    ref={webcamVideoRef}
                    autoPlay
                    playsInline
                    className="webcam-video"
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="webcam-controls">
                    <button
                      type="button"
                      className="capture-btn"
                      onClick={captureImage}
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      className="cancel-webcam-btn"
                      onClick={stopWebcam}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="image-preview-area error-message">
                <span style={{ color: '#d32f2f' }}>Error: {error}</span>
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => setError(null)}
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* Image Preview Area */}
            {imagePreviewUrl && (
              <div className="image-preview-area">
                <img src={imagePreviewUrl} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                  disabled={isSending}
                >
                  <FaTimes />
                </button>
              </div>
            )}

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <div className="attachment-buttons">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  disabled={!chatPartner || isChatDisabled || isSending}
                />
                <button
                  type="button"
                  className="attach-button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={!chatPartner || isChatDisabled || isSending}
                  title="Attach Image"
                >
                  <FaImage />
                </button>
                <button
                  type="button"
                  className="webcam-button"
                  onClick={startWebcam}
                  disabled={!chatPartner || isChatDisabled || isSending}
                  title="Take Photo"
                >
                  <FaCamera />
                </button>
              </div>

              <input
                type="text"
                placeholder={isChatDisabled ? `Chat disabled - ${disableReason}` : "Type your message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
                disabled={!chatPartner || isChatDisabled || isSending}
              />
              <button
                type="submit"
                className="send-button"
                disabled={!chatPartner || (newMessage.trim() === '' && !imageFile) || isChatDisabled || isSending}
                title={isChatDisabled ? `Chat disabled - ${disableReason}` : isSending ? "Sending..." : "Send message"}
              >
                {isSending ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <FaPaperPlane />
                )}
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
                  <div className="info-row">
                    <span className="label">Sending Status:</span>
                    <span className="value" style={{ color: isSending ? '#f59e0b' : '#22c55e', fontWeight: 'bold' }}>
                      {isSending ? 'Sending...' : 'Ready'}
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