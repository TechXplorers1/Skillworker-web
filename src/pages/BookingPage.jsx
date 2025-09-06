import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BookingPage = () => {
  const { serviceName, technicianId } = useParams();
  const navigate = useNavigate();

  // Retrieve technician data from session storage
  const storedTechnician = sessionStorage.getItem('selectedTechnician');
  const technician = storedTechnician ? JSON.parse(storedTechnician) : {
    // Fallback mock data in case storage is empty (e.g., page refresh)
    id: technicianId || 'tech1',
    name: 'TECHY 1',
    service: serviceName || 'Plumber',
    rating: '4.8',
    reviews: '127',
    experience: '5+ years',
    distance: '2.3 km away',
    price: { type: 'hourly', amount: 45 },
    image: 'https://placehold.co/56x56/E5E7EB/4B5563?text=AV',
    available: true,
  };

  const makeDates = () => {
    const today = new Date();
    const mk = (d, i) => {
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const sub = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { id: i, label, sub, disabled: i === 2 };
    };

    const arr = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      arr.push(mk(d, i));
    }
    return arr;
  };

  const dates = makeDates();
  const [selectedDateId, setSelectedDateId] = useState(dates[0].id);
  const timeSlots = [
    { label: '9:00 AM', disabled: true },
    { label: '11:00 AM', disabled: false },
    { label: '2:00 PM', disabled: false },
    { label: '4:00 PM', disabled: false },
    { label: '6:00 PM', disabled: true },
  ];
  const [selectedTime, setSelectedTime] = useState('2:00 PM');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const selectedDate = dates.find(d => d.id === selectedDateId);
  // Calculate subtotal and total dynamically based on technician data
  const subtotal = (technician.price.type === 'hourly' ? technician.price.amount * 2 : technician.price.amount);
  const serviceFee = 5;
  const total = subtotal + serviceFee;

  useEffect(() => {
    if (showPopup) {
      setBookingId(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
  }, [showPopup]);

  const handleBack = () => navigate(-1);
  const handleConfirmBooking = () => {
    setShowPopup(true);
  };
  const handleViewBooking = () => {
    navigate('/my-bookings');
  };

  const BookingConfirmationPopup = () => {
    if (!showPopup) return null;

    return (
      <div className="popup-overlay">
        <div className="popup-card">
          <div className="popup-header">
            <div className="popup-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L207 371c-9.4 9.4-24.6 9.4-33.9 0L123 325c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35.1 35.1L335.1 175.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
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
                <span>{technician.service}</span>
              </div>
              <div className="details-row">
                <span>Technician:</span>
                <span>{technician.name}</span>
              </div>
              <div className="details-row">
                <span>Date & Time:</span>
                <span>{selectedDate.label}, {selectedTime}</span>
              </div>
              <div className="details-row">
                <span>Estimated Cost:</span>
                <span>${total}</span>
              </div>
            </div>

            <div className="what-happens-next-card">
              <h3>What happens next?</h3>
              <ul>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L207 371c-9.4 9.4-24.6 9.4-33.9 0L123 325c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35.1 35.1L335.1 175.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg> Your technician will contact you shortly</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L207 371c-9.4 9.4-24.6 9.4-33.9 0L123 325c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35.1 35.1L335.1 175.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg> You'll receive a SMS/email confirmation</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L207 371c-9.4 9.4-24.6 9.4-33.9 0L123 325c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l35.1 35.1L335.1 175.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg> Track your service in real-time</li>
              </ul>
            </div>
            
            <button className="btn primary full-width" onClick={handleViewBooking}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm-72 96a72 72 0 1 0 0 144 72 72 0 1 0 0-144zM24 88c-13.3 0-24 10.7-24 24V408c0 13.3 10.7 24 24 24H488c13.3 0 24-10.7 24-24V112c0-13.3-10.7-24-24-24H24zM300 176c0 28.5-12.6 53.6-32 71.3V344c0 13.3-10.7 24-24 24s-24-10.7-24-24V247.3c-19.4-17.7-32-42.8-32-71.3c0-44.2 35.8-80 80-80s80 35.8 80 80z"/></svg>
              View Booking
            </button>
            <p className="popup-caption" onClick={handleBack}>Go back to homepage</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="booking-page-container">
         <Header />
      <style>
        {`
        /* Page shell */
        .booking-page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f5f7fb;
          padding-top: 60px;
        }

        .booking-main-content {
          flex: 1;
          max-width: 1180px;
          margin: 0 auto;
          width: 100%;
          padding: 16px;
        }

        .back-nav { margin-bottom: 8px; }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: #0d6efd;
          font-size: 14px;
          cursor: pointer;
        }
        .back-button:hover { color: #0b5ed7; }

        /* Title */
        .page-title {
          text-align: center;
          margin-bottom: 18px;
        }
        .page-title h1 {
          margin: 0 0 4px;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }
        .page-title p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        /* Layout */
        .booking-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 18px;
          align-items: start;
        }

        /* Cards */
        .card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(16,24,40,.06);
          border: 1px solid #eef0f4;
          padding: 16px;
        }

        /* Left column blocks */
        .left-col { display: flex; flex-direction: column; gap: 16px; }

        /* --- Service Details --- */
        .service-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .service-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .service-title h2 {
          margin: 0;
          font-size: 18px;
          color: #111827;
          font-weight: 700;
        }
        .service-badge {
          background: #e7f0ff;
          color: #0d6efd;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #d6e6ff;
        }

        .rate-box { text-align: right; }
        .rate {
          font-weight: 800;
          font-size: 22px;
          color: #16a34a;
          line-height: 1;
          margin-bottom: 4px;
        }
        .avail-link {
          background: transparent;
          border: none;
          color: #16a34a;
          font-size: 12px;
          cursor: default;
        }

        .pro-row {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 12px;
          align-items: center;
        }
        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
        }
        .pro-info { display: flex; flex-direction: column; gap: 6px; }
        .pro-top { display: flex; align-items: center; gap: 12px; }
        .pro-name { margin: 0; font-size: 18px; color: #0f172a; font-weight: 700; }

        .stars {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 14px;
        }
        .star { color: #fbbf24; }
        .muted { color: #9ca3af; }

        .pro-meta {
          display: flex;
          gap: 16px;
          color: #6b7280;
          font-size: 13px;
        }
        .pro-meta svg { width: 14px; height: 14px; }
        .pro-meta span { display: inline-flex; align-items: center; gap: 6px; }

        /* --- Included --- */
        .included h3 {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }
        .included > p {
          margin: 0 0 8px;
          color: #6b7280;
          font-size: 14px;
        }
        .included ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .included li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #374151;
          font-size: 14px;
          padding: 4px 0;
        }
        .included li svg { width: 14px; height: 14px; color: #16a34a; }

        /* --- Select Date & Time --- */
        .section-title {
          margin: 0 0 10px;
          font-size: 18px;
          color: #111827;
          font-weight: 700;
        }
        .subsection { margin-top: 8px; }
        .subsection h4 {
          margin: 0 0 8px;
          font-size: 14px;
          color: #111827;
          font-weight: 700;
        }

        .dates-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .times-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          gap: 4px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #f9fafb;
          font-size: 14px;
          cursor: pointer;
          transition: border-color .15s, background .15s, color .15s;
        }
        .chip:hover { border-color: #0d6efd; }
        .chip.selected {
          background: #0d6efd;
          color: #fff;
          border-color: #0d6efd;
        }
        .chip.disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .date-label { font-weight: 700; }
        .date-sub { font-size: 12px; opacity: .9; }

        .instructions-input {
          width: 100%;
          min-height: 90px;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          resize: vertical;
          font-size: 14px;
        }
        .instructions-input:focus {
          outline: none;
          border-color: #0d6efd;
        }

        /* Right column */
        .right-col { display: flex; flex-direction: column; gap: 16px; }

        /* --- Booking Summary --- */
        .booking-summary .section-title { margin-bottom: 10px; }
        .summary-rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 10px;
        }
        .summary-rows .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eef0f4;
          padding-bottom: 8px;
          font-size: 14px;
          color: #111827;
        }
        .summary-rows .row.total {
          border-bottom: none;
          padding-top: 8px;
          border-top: 2px solid #e5e7eb;
          font-weight: 800;
          font-size: 16px;
        }

        .hint {
          margin-top: 8px;
          padding: 12px;
          background: #fff7ed;
          border: 1px solid #fde7c7;
          border-radius: 10px;
          color: #92400e;
          font-size: 13px;
        }

        .appt-mini {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-top: 10px;
        }
        .appt-mini .mini {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #111827;
          font-size: 14px;
        }
        .appt-mini .mini svg { width: 14px; height: 14px; }

        .actions { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
        .rowed { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .btn.primary { background: #0d6efd; color: #fff; }
        .btn.primary:hover { background: #0b5ed7; }
        .btn.outline { background: #ffffff; border-color: #e5e7eb; color: #111827; }
        .btn.outline:hover { background: #f8fafc; }
        .btn.ghost { background: #f3f4f6; color: #111827; }
        .btn.ghost:hover { background: #e5e7eb; }
        .btn svg { width: 14px; height: 14px; }

        .guarantee {
          margin-top: 12px;
          padding: 12px;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          text-align: left;
        }
        .guarantee h4 { margin: 0 0 4px; font-size: 14px; color: #065f46; }
        .guarantee p { margin: 0; font-size: 13px; color: #065f46; }

        /* --- Help --- */
        .help h3 { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #111827; }
        .help .help-line { font-size: 14px; color: #374151; padding: 6px 0; }

        /* Booking Confirmation Popup */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .popup-card {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          animation: slideUp .3s ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .popup-header {
          height: 60px;
          background: #0d6efd;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          position: relative;
        }

        .popup-icon {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          color: #0d6efd;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .popup-icon svg { width: 28px; height: 28px; }

        .popup-content {
          padding: 30px 24px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .popup-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .popup-message {
          font-size: 14px;
          color: #6b7280;
          margin-top: 0;
        }

        .booking-details-card, .what-happens-next-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .booking-details-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .booking-details-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }

        .booking-status {
          background: #dcfce7;
          color: #16a34a;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #bbf7d0;
        }

        .details-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          color: #374151;
        }
        .details-row span:last-child { font-weight: 600; color: #111827; }

        .what-happens-next-card h3 {
          margin: 0 0 10px;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }
        .what-happens-next-card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .what-happens-next-card li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #374151;
        }
        .what-happens-next-card li svg { width: 14px; height: 14px; color: #16a34a; }

        .btn.full-width { width: 100%; margin-top: 4px; }

        .popup-caption {
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
          text-decoration: underline;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .booking-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .dates-grid { grid-template-columns: repeat(2, 1fr); }
          .times-grid { grid-template-columns: repeat(3, 1fr); }
          .rowed { grid-template-columns: 1fr; }
        }
        `}
      </style>


      <div className="booking-main-content">
        <div className="back-nav">
          <button className="back-button" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.2l105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg> Back
          </button>
        </div>

        <div className="page-title">
          <h1>Confirm Your Booking</h1>
          <p>Review the details and confirm your service booking</p>
        </div>

        <div className="booking-layout">
          <div className="left-col">
            <div className="card service-details">
              <div className="service-head">
                <div className="service-title">
                  <h2>Service Details</h2>
                  <span className="service-badge">{technician.service}</span>
                </div>
                <div className="rate-box">
                  <div className="rate">${technician.price.amount}/{technician.price.type === 'hourly' ? 'hr' : 'day'}</div>
                  <button className="avail-link" type="button">
                    {technician.available ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              </div>
              <div className="pro-row">
                <img className="avatar" src={technician.image} alt={technician.name} />
                <div className="pro-info">
                  <div className="pro-top">
                    <h3 className="pro-name">{technician.name}</h3>
                    <div className="stars">
                      <span className="star">★</span>
                      <span>{technician.rating}</span>
                      <span className="muted">({technician.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="pro-meta">
                    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.5 4.7 32.9-6.3s4.7-25.5-6.3-32.9L280 232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg> {technician.experience} experience</span>
                    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
 {technician.distance}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card included">
              <h3>What's included:</h3>
              <p>Professional {technician.service.toLowerCase()} repair and maintenance service</p>
              <ul>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg> Professional consultation and assessment</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg> All necessary tools and basic materials</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg> Quality guarantee on work performed</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg> Clean-up after service completion</li>
              </ul>
            </div>

            <div className="card date-time">
              <h2 className="section-title">Select Date & Time</h2>
              <div className="subsection">
                <h4>Available Dates</h4>
                <div className="dates-grid">
                  {dates.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      disabled={d.disabled}
                      className={['chip date-chip', selectedDateId === d.id ? 'selected' : '', d.disabled ? 'disabled' : '',].join(' ')}
                      onClick={() => !d.disabled && setSelectedDateId(d.id)}
                    >
                      <span className="date-label">{d.label}</span>
                      <span className="date-sub">{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="subsection">
                <h4>Available Times</h4>
                <div className="times-grid">
                  {timeSlots.map(t => (
                    <button
                      key={t.label}
                      type="button"
                      disabled={t.disabled}
                      onClick={() => !t.disabled && setSelectedTime(t.label)}
                      className={['chip time-chip', selectedTime === t.label ? 'selected' : '', t.disabled ? 'disabled' : ''].join(' ')}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="subsection">
                <h4>Special Instructions (Optional)</h4>
                <textarea
                  className="instructions-input"
                  placeholder="Any specific requirements or details about the job..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="right-col">
            <div className="card booking-summary">
              <h2 className="section-title">Booking Summary</h2>
              <div className="summary-rows">
                <div className="row">
                  <span>{technician.price.type === 'hourly' ? 'Hourly Rate' : 'Daily Rate'}</span>
                  <span>${technician.price.amount}/{technician.price.type === 'hourly' ? 'hr' : 'day'}</span>
                </div>
                {technician.price.type === 'hourly' && (
                  <div className="row">
                    <span>Estimated Hours</span>
                    <span>2 hours</span>
                  </div>
                )}
                <div className="row">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="row">
                  <span>Service Fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="row total">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
              <div className="hint">
                <strong>Note:</strong> Final cost may vary based on actual time and materials used.
              </div>
              <div className="appt-mini">
                <div className="mini">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h352V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"/></svg>
                  <span>{selectedDate.label}, {selectedDate.sub}</span>
                </div>
                <div className="mini">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.5 4.7 32.9-6.3s4.7-25.5-6.3-32.9L280 232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
                  <span>{selectedTime}</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn primary" onClick={handleConfirmBooking}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
                  Confirm Booking
                </button>
                <div className="rowed">
                  <button className="btn outline">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
                    Help
                  </button>
                  <button className="btn ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                    Cancel
                  </button>
                </div>
              </div>
              <div className="guarantee">
                <h4>Happiness Guaranteed</h4>
                <p>If you're not satisfied with the service, we'll work to make it right or provide a refund.</p>
              </div>
            </div>

            <div className="card help">
              <h3>Need Help?</h3>
              <div className="help-line">
                <strong>Call us:</strong> 1-800-123-4567
              </div>
              <div className="help-line">
                <strong>Email:</strong> support@fixit.com
              </div>
              <div className="help-line">
                <strong>Hours:</strong> Mon-Fri 8am-8pm, Sat-Sun 9am-5pm
              </div>
            </div>
          </div>
        </div>
      </div>
   <Footer />
      <BookingConfirmationPopup />
    </div>
  );
};

export default BookingPage;