import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaRegClock,
  FaRupeeSign,
  FaStar,
} from 'react-icons/fa';
import '../styles/MyBookingsPage.css';

const MyBookingsPage = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedDate, setSelectedDate] = useState('');
  const [bookings, setBookings] = useState([]);

  // Initialize bookings data
  useEffect(() => {
    const initialBookings = [
      {
        id: 'bkg1',
        service: 'Electrician',
        technicianName: 'Bharath Surya',
        technicianRating: '4.8',
        technicianAvatar: '/path/to/techy1-avatar.png',
        status: 'Active',
        bookedOn: '31/05/2025 12:29',
        date: '31/05/2025',
        dateObj: new Date('2025-05-31'),
        time: 'Afternoon (12:00 PM - 3:00 PM)',
        duration: '2-3 hours',
        location: 'Bengaluru',
        price: 1350,
        description: 'I have pipe leaking issue',
        bookingId: '#48'
      },
      {
        id: 'bkg2',
        service: 'Electrician',
        technicianName: 'chav tech',
        technicianRating: '4.9',
        technicianAvatar: '/path/to/alex-avatar.png',
        status: 'Accepted',
        bookedOn: '30/05/2025 11:25',
        date: '30/05/2025',
        dateObj: new Date('2025-05-30'),
        time: 'Afternoon (12:00 PM - 3:00 PM)',
        duration: '1-2 hours',
        location: 'Mumbai',
        price: 850,
        description: 'bb',
        bookingId: '#49'
      },
      {
        id: 'bkg3',
        service: 'Plumber',
        technicianName: 'chav tech',
        technicianRating: '4.7',
        technicianAvatar: '/path/to/coolfix1-avatar.png',
        status: 'Completed',
        bookedOn: '24/05/2025 11:18',
        date: '24/05/2025',
        dateObj: new Date('2025-05-24'),
        time: 'Afternoon (12:00 PM - 3:00 PM)',
        duration: '2 hours',
        location: 'Delhi',
        price: 1200,
        description: 'chat sorting test',
        bookingId: '#47'
      },
      {
        id: 'bkg4',
        service: 'Electrician',
        technicianName: 'Sandy Sandy',
        technicianRating: '4.5',
        technicianAvatar: '/path/to/ironfix1-avatar.png',
        status: 'Active',
        bookedOn: '10/09/2025 12:55',
        date: '10/09/2025',
        dateObj: new Date('2025-09-10'),
        time: 'Afternoon (12:00 PM - 3:00 PM)',
        duration: '4 hours',
        location: 'Bengaluru',
        price: 3800,
        description: 'AC not cooling properly',
        bookingId: '#46'
      },
      {
        id: 'bkg5',
        service: 'Electrician',
        technicianName: 'Gopi Ravi',
        technicianRating: '4.7',
        technicianAvatar: '/path/to/electro2-avatar.png',
        status: 'Canceled',
        bookedOn: '08/09/2025 14:52',
        date: '08/09/2025',
        dateObj: new Date('2025-09-08'),
        time: 'Afternoon (12:00 PM - 3:00 PM)',
        duration: '1-2 hours',
        location: 'Mumbai',
        price: 4500,
        description: 'house wiring',
        bookingId: '#45'
      },
    ];
    setBookings(initialBookings);
  }, []);

  const serviceTypes = ['All Services', ...new Set(bookings.map(booking => booking.service))];

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = activeFilter === 'All' || booking.status === activeFilter;
    const matchesService = selectedService === 'All Services' || booking.service === selectedService;
    const matchesDate = !selectedDate || booking.dateObj.toDateString() === new Date(selectedDate).toDateString();
    const matchesSearch = searchTerm === '' ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesService && matchesDate && matchesSearch;
  });

  const handleBookingClick = (bookingId) => {
    navigate(`/booking-details/${bookingId}`);
  };

  const handleCancelBooking = (bookingId) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'Canceled' } : booking
      )
    );
  };

  const handleCompleteBooking = (bookingId) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'Completed' } : booking
      )
    );
  };

    const handleChatClick = (booking) => {
    navigate('/chat/booking', { 
      state: { 
        technician: {
          name: booking.technicianName,
          service: booking.service,
          rating: booking.technicianRating,
          experience: '5+ years' // Default value
        },
        bookingDetails: {
          service: booking.service,
          date: booking.date,
          time: booking.time,
          location: booking.location,
          price: booking.price,
          description: booking.description
        }
      } 
    });
  };

  return (
    <div className="my-bookings-page-container">
      <Header />
      <main className="my-bookings-main-content">
        <div className="bookings-header">
          <div className="filter-search-bar">
            <select
              className="service-select"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {serviceTypes.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="toggle-container">
          <div className="glass-radio-group">
            <input
              type="radio"
              name="plan"
              id="active"
              checked={activeFilter === 'Active'}
              onChange={() => setActiveFilter('Active')}
            />
            <label htmlFor="active">Active</label>
            <input
              type="radio"
              name="plan"
              id="accepted"
              checked={activeFilter === 'Accepted'}
              onChange={() => setActiveFilter('Accepted')}
            />
            <label htmlFor="accepted">Accepted</label>
            <input
              type="radio"
              name="plan"
              id="completed"
              checked={activeFilter === 'Completed'}
              onChange={() => setActiveFilter('Completed')}
            />
            <label htmlFor="completed">Completed</label>
            <input
              type="radio"
              name="plan"
              id="canceled"
              checked={activeFilter === 'Canceled'}
              onChange={() => setActiveFilter('Canceled')}
            />
            <label htmlFor="canceled">Canceled</label>
            <div className="glass-glider1" />
          </div>
        </div>

        <div className="bookings-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className={`booking-card ${booking.status.toLowerCase()}`}>
                <div className="booking-card-header">
                  <div className="service-info">
                    <span className="service-title">{booking.service}</span>
                    <span className="booked-on">Booked on: {booking.bookedOn}</span>
                  </div>
                  <div className="header-right-section">
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </div>
                </div>

                <div className="technician-info-row">
                  <div className="tech-avatar-wrapper">
                      <span className="tech-avatar-placeholder">
                        {booking.technicianName.charAt(0)}
                      </span>
                  </div>
                  <div className="tech-name-rating">
                    <span className="tech-name">Technician: {booking.technicianName}</span>
                    <div className="tech-rating">
                      <FaStar className="star-icon" />
                      <span>{booking.technicianRating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="booking-details-grid">
                  <div className="detail-row">
                    <FaRegClock className="detail-icon" />
                    <span>Date: {booking.date}</span>
                  </div>
                  <div className="detail-row">
                    <FaRegClock className="detail-icon" />
                    <span>Timings: {booking.time}</span>
                  </div>
                  <div className="detail-row">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="detail-row">
                    <FaRupeeSign className="detail-icon rupee-icon" />
                    <span>{booking.price}</span>
                  </div>
                </div>
                  
                <div className="description-row">
                  <span className="description-label">Description:</span>
                  <span className="booking-description">{booking.description}</span>
                </div>

                {booking.status === 'Active' && (
                  <div className="booking-actions">
                    <button 
                      className="action-btn1 cancel-btn"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                    {booking.status === 'Accepted' && (
                <div className="booking-actions">
                  <button 
                    className="action-btn1 cancel-btn"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="action-btn1 chat-btn"
                    onClick={() => handleChatClick(booking)}
                  >
                    Chat
                  </button>
                  <button 
                    className="action-btn1 complete-btn"
                    onClick={() => handleCompleteBooking(booking.id)}
                  >
                    Complete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results-message">
            <p>No bookings found for the selected filter or search term.</p>
          </div>
        )}
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBookingsPage;