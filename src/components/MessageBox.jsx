import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, database } from "../firebase";
import "../styles/MessageBox.css";

const MessageBox = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const userChatsRef = ref(database, `userChats/${user.uid}`);
        
        onValue(userChatsRef, (snapshot) => {
          const chats = snapshot.val();
          if (chats) {
            const fetchedChats = Object.keys(chats).map(key => ({
              id: key,
              ...chats[key]
            }));
            
            // Fetch user details for each chat partner
            const chatPromises = fetchedChats.map(async (chat) => {
              const partnerRef = ref(database, `users/${chat.id}`);
              return new Promise((resolve) => {
                onValue(partnerRef, (userSnapshot) => {
                  const partnerData = userSnapshot.val();
                  resolve({
                    ...chat,
                    partnerName: `${partnerData?.firstName || ''} ${partnerData?.lastName || ''}`.trim() || 'N/A',
                    partnerRole: partnerData?.role || 'N/A',
                    lastMessage: chat.lastMessage || '',
                    time: chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString() : 'N/A',
                    unread: chat.unreadCount || 0
                  });
                }, { onlyOnce: true });
              });
            });

            Promise.all(chatPromises).then((results) => {
              setChatList(results);
              setLoading(false);
            });
          } else {
            setChatList([]);
            setLoading(false);
          }
        });
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const openChat = (chat) => {
    navigate(`/chat/${chat.chatId}`);
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="message-box">
      <Header />
      <div className="message-container">
        <h2>Messages</h2>
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <div
              key={chat.chatId}
              className="message-card"
              onClick={() => openChat(chat)}
            >
              <div className="message-header">
                <div className="avatar">{chat.partnerName[0]}</div>
                <div className="info">
                  <div className="top-row">
                    <span className="name">{chat.partnerName}</span>
                    <span className="rating">⭐ N/A</span> {/* Rating not directly in userChats */}
                    <span className="time">{chat.time}</span>
                  </div>
                  <div className="service-row">
                    <span className="service">{chat.partnerRole}</span>
                    <span className="status">Active</span>
                  </div>
                  <div className="location">N/A</div>
                  <div className="text">{chat.lastMessage || "No messages yet."}</div>
                  <div className="online-status online">Online now</div>
                </div>
                {chat.unread > 0 && (
                  <div className="unread-badge">{chat.unread}</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages-message">
            <p>You have no recent messages.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MessageBox;