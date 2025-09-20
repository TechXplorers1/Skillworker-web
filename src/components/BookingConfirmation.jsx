import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BookingConfirmation.css';

const BookingConfirmationPopup = ({ show, bookingId, technician, serviceDetails, selectedDate, selectedTime, total, onBack, onNavigateHome }) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-header">
          <div className="popup-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L207 371c-9.4 9.4-24.6 9.4-33.9 0L123 325c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35.1 35.1L335.1 175.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
          </div>
        </div>
        <div className="popup-content">
          <h2 className="popup-title">Booking Confirmed!</h2>
          <p className="popup-message">Your service has been successfully booked. You'll receive a confirmation message shortly.</p>

          <div className="booking-details-card">
            <div className="booking-details-header">
              <h3>Booking Details</h3>
              <span className="booking-status">Confirmed</span>
            </div>
            <div className="details-row">
              <span>Booking ID:</span>
              <span>{bookingId}</span>
            </div>
            <div className="details-row">
              <span>Service:</span>
              <span>{serviceDetails?.title || 'N/A'}</span>
            </div>
            <div className="details-row">
              <span>Technician:</span>
              <span>{technician?.firstName || 'N/A'} {technician?.lastName || 'N/A'}</span>
            </div>
            <div className="details-row">
              <span>Date & Time:</span>
              <span>{selectedDate?.label}, {selectedTime}</span>
            </div>
            <div className="details-row">
              <span>Estimated Cost:</span>
              <span>&#8377;{total}</span>
            </div>
          </div>

          <div className="what-happens-next-card">
            <h3>What happens next?</h3>
            <ul>
              <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L207 371c-9.4 9.4-24.6 9.4-33.9 0L123 325c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35.1 35.1L335.1 175.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg> Your technician will contact you shortly</li>
              <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L207 371c-9.4 9.4-24.6 9.4-33.9 0L123 325c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35.1 35.1L335.1 175.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg> You'll receive a SMS/email confirmation</li>
              <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L207 371c-9.4 9.4-24.6 9.4-33.9 0L123 325c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35.1 35.1L335.1 175.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg> Track your service in real-time</li>
            </ul>
          </div>

          <button className="btn primary full-width" onClick={() => navigate('/my-bookings')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM232 120a72 72 0 1 0 0 144 72 72 0 1 0 0-144zM24 88c-13.3 0-24 10.7-24 24V408c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
            View Booking
          </button>
          <p className="popup-caption" onClick={() => navigate('/')}>Go back to homepage</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPopup;