import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, get, child, push, set } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from '../firebase';
import BookingConfirmationPopup from '../components/BookingConfirmation';

const BookingPage = () => {
  const { serviceName, technicianId } = useParams();
  const navigate = useNavigate();

  const [technician, setTechnician] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchAllData();
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    const dbRef = ref(database);
    try {
      const technicianSnapshot = await get(child(dbRef, `users/${technicianId}`));
      const servicesSnapshot = await get(child(dbRef, 'services'));

      if (technicianSnapshot.exists() && servicesSnapshot.exists()) {
        const fetchedTechnician = technicianSnapshot.val();
        setTechnician(fetchedTechnician);

        const servicesData = servicesSnapshot.val();
        const serviceEntry = Object.values(servicesData).find(s =>
          s.title?.toLowerCase()?.replace(/\s/g, '-') === serviceName.toLowerCase()
        );

        if (serviceEntry) {
          setServiceDetails(serviceEntry);
        }
      } else {
        console.log("No data available for this technician or services.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitial = (name) => {
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length > 1) {
        return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return 'T';
  };

  const makeDates = () => {
    const today = new Date();
    const arr = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const sub = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      arr.push({ id: i, label, sub, disabled: i === 2, date: d.toISOString().split('T')[0] });
    }
    return arr;
  };

  const dates = makeDates();
  const [selectedDateId, setSelectedDateId] = useState(dates[0].id);
  const timeSlots = [
    { label: 'Morning (8:00 AM - 11:00 AM)', value: '8:00 AM - 11:00 AM' },
    { label: 'Afternoon (12:00 PM - 3:00 PM)', value: '12:00 PM - 3:00 PM' },
    { label: 'Evening (4:00 PM - 7:00 PM)', value: '4:00 PM - 7:00 PM' },
  ];
  const [selectedTime, setSelectedTime] = useState(timeSlots[1].label);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [creatingBooking, setCreatingBooking] = useState(false);

  const selectedDate = dates.find(d => d.id === selectedDateId);
  const subtotal = (technician?.price?.type === 'hourly' ? technician.price.amount * 1 : technician?.price?.amount) || 0;
  const serviceFee = 5;
  const total = subtotal + serviceFee;

  const createBooking = async () => {
    if (!currentUser || !technician || !serviceDetails) {
      console.error('Missing required data for booking');
      return null;
    }

    setCreatingBooking(true);
    try {
      const bookingsRef = ref(database, 'bookings');
      const newBookingRef = push(bookingsRef);
      
      const bookingData = {
        id: newBookingRef.key,
        uid: currentUser.uid,
        technicianId: technicianId,
        serviceName: serviceDetails.title,
        serviceId: Object.keys(serviceDetails)[0], // Get the service ID
        date: selectedDate.date,
        timing: timeSlots.find(t => t.label === selectedTime)?.value || selectedTime,
        address: 'Address to be provided', // You can add an address field to the form
        description: specialInstructions || 'No special instructions',
        price: total,
        status: 'pending',
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        customerName: `${currentUser.displayName || 'Customer'}`,
        technicianName: `${technician.firstName} ${technician.lastName}`
      };

      await set(newBookingRef, bookingData);
      console.log('Booking created successfully:', newBookingRef.key);
      return newBookingRef.key;
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    } finally {
      setCreatingBooking(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (creatingBooking) return;

    const bookingKey = await createBooking();
    if (bookingKey) {
      setBookingId(bookingKey);
      setShowPopup(true);
    } else {
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleBack = () => navigate(-1);

  if (loading || !technician || !currentUser) {
    return <div>Loading...</div>;
  }
  
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
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d6efd;
          color: white;
          font-weight: 700;
          font-size: 24px;
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
        .included {
          min-height: auto;
        }
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
          padding: 2px 0;
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
          grid-template-columns: repeat(3, 1fr);
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
          font-family: inherit;
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
          transition: all 0.2s;
        }
        .btn.primary { background: #0d6efd; color: #fff; }
        .btn.primary:hover { background: #0b5ed7; }
        .btn.primary:disabled { background: #6c757d; cursor: not-allowed; }
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
                  <span className="service-badge">{serviceDetails?.title || 'N/A'}</span>
                </div>
              </div>
              <div className="pro-row">
                <div className="avatar">{getInitial(technician?.firstName + ' ' + technician?.lastName)}</div>
                <div className="pro-info">
                  <div className="pro-top">
                    <h3 className="pro-name">{technician?.firstName || 'TECHY'} {technician?.lastName || '1'}</h3>
                    <div className="stars">
                      <span className="star">&#9733;</span>
                      <span>{technician?.averageRating?.toFixed(1) || 'N/A'}</span>
                      <span className="muted">({technician?.totalRatings || 0} reviews)</span>
                    </div>
                  </div>
                  <div className="pro-meta">
                    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.5 4.7 32.9-6.3s4.7-25.5-6.3-32.9L280 232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" /></svg> {technician?.experience || 'N/A'} experience</span>
                    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" /></svg>
                      {technician?.city}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card included">
              <h3>What's included:</h3>
              <p>Professional {serviceDetails?.title || 'N/A'} repair and maintenance service</p>
              <ul>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> Professional consultation and assessment</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> All necessary tools and basic materials</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> Quality guarantee on work performed</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> Clean-up after service completion</li>
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
                      onClick={() => setSelectedTime(t.label)}
                      className={['chip time-chip', selectedTime === t.label ? 'selected' : ''].join(' ')}
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
                  <span>{technician?.price?.type === 'hourly' ? 'Hourly Rate' : 'Daily Rate'}</span>
                  <span>&#8377;{technician?.price?.amount || 'N/A'}/{technician?.price?.type === 'hourly' ? 'hr' : 'day'}</span>
                </div>
                {technician?.price?.type === 'hourly' && (
                  <div className="row">
                    <span>Estimated Hours</span>
                    <span>1 hour</span>
                  </div>
                )}
                <div className="row">
                  <span>Subtotal</span>
                  <span>&#8377;{subtotal}</span>
                </div>
                <div className="row">
                  <span>Service Fee</span>
                  <span>&#8377;{serviceFee}</span>
                </div>
                <div className="row total">
                  <span>Total</span>
                  <span>&#8377;{total}</span>
                </div>
              </div>
              <div className="hint">
                <strong>Note:</strong> Final cost may vary based on actual time and materials used.
              </div>
              <div className="appt-mini">
                <div className="mini">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z" /></svg>
                  <span>{selectedDate.label}, {selectedDate.sub}</span>
                </div>
                <div className="mini">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.5 4.7 32.9-6.3s4.7-25.5-6.3-32.9L280 232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" /></svg>
                  <span>{selectedTime}</span>
                </div>
              </div>
              <div className="actions">
                <button 
                  className={`btn primary ${creatingBooking ? 'disabled' : ''}`} 
                  onClick={handleConfirmBooking}
                  disabled={creatingBooking}
                >
                  {creatingBooking ? 'Creating Booking...' : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                      Confirm Booking
                    </>
                  )}
                </button>
                <div className="rowed">
                  <button className="btn outline" onClick={handleBack}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" /></svg>
                    Back
                  </button>
                  <button className="btn ghost" onClick={() => navigate('/')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
                    Home
                  </button>
                </div>
              </div>
              <div className="guarantee">
                <h4>Service Guarantee</h4>
                <p>Your satisfaction is guaranteed. If you're not happy with the service, we'll make it right.</p>
              </div>
            </div>
            <div className="card help">
              <h3>Need Help?</h3>
              <div className="help-line">
                <strong>Call us:</strong> +91 9988218879
              </div>
              <div className="help-line">
                <strong>Email:</strong> support@skillworkers.com
              </div>
              <div className="help-line">
                <strong>Hours:</strong> Mon-Fri 8am-8pm, Sat-Sun 9am-5pm
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <BookingConfirmationPopup
        show={showPopup}
        bookingId={bookingId}
        technician={technician}
        serviceDetails={serviceDetails}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        total={total}
        onBack={() => navigate('/')}
        onViewBooking={() => navigate('/my-bookings')}
      />
    </div>
  );
};

export default BookingPage;