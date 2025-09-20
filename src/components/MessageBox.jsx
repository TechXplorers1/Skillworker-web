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
        // Path to the current user's chat list
        const userChatsRef = ref(database, `userChats/${user.uid}`);
        
        const unsubscribeChats = onValue(userChatsRef, (snapshot) => {
          const chatsData = snapshot.val();
          if (chatsData) {
            // Directly map over the chat data, no extra fetching needed
            const fetchedChats = Object.entries(chatsData).map(([partnerId, chatDetails]) => ({
              partnerId: partnerId,
              chatId: chatDetails.chatId,
              partnerName: chatDetails.name || 'Unknown User', // Use the name from userChats
              lastMessage: chatDetails.lastMessage || '',
              time: chatDetails.lastMessageTime ? new Date(chatDetails.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              unread: chatDetails.unreadCount || 0
            }));

            // Sort chats by the most recent message
            fetchedChats.sort((a, b) => {
                const timeA = a.lastMessageTime || 0;
                const timeB = b.lastMessageTime || 0;
                return timeB - timeA;
            });
            
            setChatList(fetchedChats);
          } else {
            setChatList([]);
          }
          setLoading(false);
        });

        return () => unsubscribeChats();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const openChat = (chat) => {
    // Navigate using the unique chatId
    navigate(`/chat/${chat.chatId}`);
  };

  if (loading) {
    return (
        <div className="message-box">
            <Header />
            <div className="loading-container">Loading messages...</div>
            <Footer />
        </div>
    );
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
                <div className="avatar">{chat.partnerName.charAt(0).toUpperCase()}</div>
                <div className="info">
                  <div className="top-row">
                    <span className="name">{chat.partnerName}</span>
                    <span className="time">{chat.time}</span>
                  </div>
                  <div className="text">{chat.lastMessage || "No messages yet."}</div>
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