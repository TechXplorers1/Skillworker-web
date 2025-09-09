import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/MessageBox.css";

const messages = [
  {
    id: 1,
    name: "Alex Thompson",
    service: "Plumbing Repair",
    location: "Wuse II, Abuja",
    status: "Active",
    time: "2 min ago",
    rating: 4.8,
    message: "I'll be there in 15 minutes. Ready to fix your plumbing issue!",
    online: true,
    unread: 2,
    technicianId: "tech1", // Added technicianId
    serviceName: "plumber" // Added serviceName
  },
  {
    id: 2,
    name: "Sarah Johnson",
    service: "Electrical Work",
    location: "Garki, Abuja",
    status: "Completed",
    time: "1 hour ago",
    rating: 4.9,
    message: "Job completed successfully! Please rate my service.",
    online: false,
    unread: 0,
    technicianId: "electro1", // Added technicianId
    serviceName: "electrician" // Added serviceName
  },
  {
    id: 3,
    name: "Mike Wilson",
    service: "AC Repair",
    location: "Maitama, Abuja",
    status: "Pending",
    time: "3 hours ago",
    rating: 4.7,
    message: "Can we reschedule to tomorrow afternoon?",
    online: true,
    unread: 1,
    technicianId: "coolfix1", // Added technicianId
    serviceName: "ac-mechanic" // Added serviceName
  },
  {
    id: 4,
    name: "SkillWorkers Support",
    service: "Support",
    location: "",
    status: "",
    time: "1 day ago",
    rating: "",
    message: "Welcome to SkiiWorkers! How can we help you today?",
    online: true,
    unread: 0,
    technicianId: "support", // Added technicianId
    serviceName: "support" // Added serviceName
  },
];

const MessageBox = () => {
  const navigate = useNavigate();

  const openChat = (msg) => {
    // Redirect to ChatScreen with both serviceName and technicianId parameters
    navigate(`/chat/${msg.serviceName}/${msg.technicianId}`);
  };

  return (
    <div className="message-box">
      <Header />
      <div className="message-container">
        <h2>Messages</h2>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="message-card"
            onClick={() => openChat(msg)}
          >
            <div className="message-header">
              <div className="avatar">{msg.name[0]}</div>
              <div className="info">
                <div className="top-row">
                  <span className="name">{msg.name}</span>
                  {msg.rating && <span className="rating">⭐ {msg.rating}</span>}
                  <span className="time">{msg.time}</span>
                </div>
                <div className="service-row">
                  <span className="service">{msg.service}</span>
                  {msg.status && <span className="status">{msg.status}</span>}
                </div>
                <div className="location">{msg.location}</div>
                <div className="text">{msg.message}</div>
                <div
                  className={`online-status ${
                    msg.online ? "online" : "offline"
                  }`}
                >
                  {msg.online ? "Online now" : "Offline"}
                </div>
              </div>
              {msg.unread > 0 && (
                <div className="unread-badge">{msg.unread}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default MessageBox;