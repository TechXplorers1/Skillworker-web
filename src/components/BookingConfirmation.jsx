import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaStar, FaCheck, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/BookingConfirmation.css';

// Mock technician data
const technicianData = {
  tech1: {
    id: 'tech1',
    name: 'TECHY 1',
    service: 'Plumbing',
    rating: '4.8',
    reviews: '127',
    experience: '5+ years',
    distance: '2.3 km',
    price: 45,
    image: '/profile1.png'
  },
  // Add more technicians as needed
};

const BookingConfirmation = () => {
  const { serviceName, technicianId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('Today, 2:00 PM');
  
  const technician = technicianData[technicianId] || {
    id: technicianId,
    name: 'Professional Technician',
    service: serviceName,
    rating: '4.5',
    reviews: '50',
    experience: '5+ years',
    distance: '2.0 km',
    price: 45,
    image: '/profile1.png'
  };

  const handleConfirmBooking = () => {
  // Set booking flag in localStorage
  localStorage.setItem(`booking_${technicianId}`, 'true');
  
  // In a real app, this would process the booking
  // For now, redirect to chat screen
  navigate(`/chat/${serviceName}/${technicianId}`);
};

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="booking-confirmation-container">
      <Header />
      
      <div className="booking-main-content">
        <div className="back-nav">
          <button className="back-button" onClick={handleBack}>
            &#8592; Back
          </button>
        </div>

        <div className="booking-content">
          <div className="booking-header">
            <h1>Confirm Your Booking</h1>
            <p>Review the details and confirm your service booking</p>
          </div>

          <div className="booking-details">
            <div className="technician-card">
              <div className="tech-header">
                <img src={technician.image} alt={technician.name} className="tech-avatar" />
                <div className="tech-info">
                  <h3>{technician.name}</h3>
                  <div className="tech-rating">
                    <FaStar className="star-icon" />
                    <span>{technician.rating} ({technician.reviews} reviews)</span>
                  </div>
                  <div className="tech-meta">
                    <span><FaClock /> {technician.experience}</span>
                    <span><FaMapMarkerAlt /> {technician.distance}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="included-services">
              <h3>What's included:</h3>
              <p>Professional {technician.service.toLowerCase()} repair and maintenance service</p>
              <ul>
                <li><FaCheck /> Professional consultation and assessment</li>
                <li><FaCheck /> All necessary tools and basic materials</li>
                <li><FaCheck /> Quality guarantee on work performed</li>
                <li><FaCheck /> Clean-up after service completion</li>
              </ul>
            </div>

            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-table">
                <div className="summary-row">
                  <span className="label">Service Rate</span>
                  <span className="value">${technician.price}/hour</span>
                </div>
                <div className="summary-row">
                  <span className="label">Estimated Duration</span>
                  <span className="value">2 hours</span>
                </div>
                <div className="summary-row">
                  <span className="label">Subtotal</span>
                  <span className="value">${technician.price * 2}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Service Fee</span>
                  <span className="value">$5</span>
                </div>
                <div className="summary-row total">
                  <span className="label">Total Estimate</span>
                  <span className="value">${technician.price * 2 + 5}</span>
                </div>
              </div>

              <div className="price-disclaimer">
                <p>Final price may vary based on actual work completed and materials used</p>
              </div>
            </div>

            <div className="selected-datetime">
              <h3>Selected Date & Time</h3>
              <div className="datetime-card">
                <span>{selectedDate}</span>
                <button 
                  className="change-btn"
                  onClick={() => navigate(`/booking/${serviceName}/${technicianId}/datetime`)}
                >
                  Change
                </button>
              </div>
            </div>

            <div className="customer-info">
              <h3>Customer Information</h3>
              <div className="customer-card">
                <span>John Customer</span>
                <button className="change-btn">Change</button>
              </div>
            </div>

            <div className="booking-actions">
              <button className="confirm-btn" onClick={handleConfirmBooking}>
                Confirm Booking
              </button>
              <button className="cancel-btn" onClick={handleBack}>
                Cancel
              </button>
            </div>

            <div className="guarantee-section">
              <div className="guarantee-badge">
                <h4>100% Satisfaction Guarantee</h4>
                <p>Your service is protected by our quality guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingConfirmation;