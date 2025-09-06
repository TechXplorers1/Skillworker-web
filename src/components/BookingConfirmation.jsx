import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BookingPage.css"; // adjust path

const BookingConfirmation = ({ isOpen, onClose, booking }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-header">
          <div className="popup-icon">🎉</div>
        </div>
        <div className="popup-content">
          <h2 className="popup-title">Booking Confirmed!</h2>
          <p className="popup-message">
            Your service has been successfully booked. You'll receive a
            confirmation message shortly.
          </p>

          {/* Booking Details */}
          <div className="booking-details-card">
            <div className="booking-details-header">
              <h3>Booking Details</h3>
              <span className="booking-status">Confirmed</span>
            </div>
            <div className="details-row">
              <span>Booking ID:</span>
              <span>{booking.id}</span>
            </div>
            <div className="details-row">
              <span>Service:</span>
              <span>{booking.service}</span>
            </div>
            <div className="details-row">
              <span>Technician:</span>
              <span>{booking.technician}</span>
            </div>
            <div className="details-row">
              <span>Date & Time:</span>
              <span>{booking.dateTime}</span>
            </div>
            <div className="details-row">
              <span>Estimated Cost:</span>
              <span style={{ color: "#16a34a" }}>{booking.cost}</span>
            </div>
          </div>

          {/* What happens next */}
          <div className="what-happens-next-card">
            <h3>What happens next?</h3>
            <ul>
              <li>Your technician will contact you shortly</li>
              <li>You'll receive SMS/email confirmation</li>
              <li>Track your service in real-time</li>
              <li>View booking anytime</li>
            </ul>
          </div>

          <button
            className="btn primary full-width"
            onClick={() => {
              onClose();
              navigate("/mybookings");
            }}
          >
            View Booking
          </button>

          <span className="popup-caption" onClick={onClose}>
            Close
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
