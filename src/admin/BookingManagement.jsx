import React, { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import '../styles/BookingManagement.css';

const BookingsManagement = () => {
  const [activeFilter, setActiveFilter] = useState('All Statuses');
  const [bookingsData, setBookingsData] = useState([]);
  const [usersData, setUsersData] = useState({});
  // New state for handling the pop-up
  const [selectedBooking, setSelectedBooking] = useState(null); 
  
  useEffect(() => {
    const bookingsRef = ref(database, "bookings");
    onValue(bookingsRef, (snapshot) => {
      const bookings = snapshot.val();
      if (bookings) {
        const fetchedBookings = Object.keys(bookings).map(key => ({
          id: key,
          ...bookings[key]
        }));
        
        // Sort by createdAt in descending order (most recent first)
        fetchedBookings.sort((a, b) => {
          // Assuming createdAt is a sortable string/timestamp, or default to an empty string if null
          const dateA = a.createdAt || "";
          const dateB = b.createdAt || "";
          return dateB.localeCompare(dateA);
        });

        setBookingsData(fetchedBookings);
      }
    });

    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      setUsersData(snapshot.val() || {});
    });
  }, []);

  const statusFilters = ['All Statuses', 'pending', 'accepted', 'completed', 'cancelled'];

  const showDetailsPopup = (booking) => {
    setSelectedBooking(booking);
  };

  const closeDetailsPopup = () => {
    setSelectedBooking(null);
  };

  const filteredBookings = activeFilter === 'All Statuses' 
    ? bookingsData 
    : bookingsData.filter(booking => booking.status === activeFilter);

  return (
    <div className="bookings-management">
      <h1>Booking Management</h1>
      
      <div className="filters">
        {statusFilters.map(filter => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      
      <div className="table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Technician</th>
              <th>Service</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => (
              <tr key={booking.id}>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{usersData[booking.uid]?.firstName} {usersData[booking.uid]?.lastName}</div>
                  </div>
                </td>
                <td>{usersData[booking.technicianId]?.firstName} {usersData[booking.technicianId]?.lastName}</td>
                <td>{booking.serviceName}</td>
                <td>
                  <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </td>
                <td>{booking.date}</td>
                <td>
                  <button 
                    className="details-btn"
                    onClick={() => showDetailsPopup(booking)}
                  >
                    Show Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Details Pop-up (Modal) */}
      {selectedBooking && (
        <div className="popup-overlay" onClick={closeDetailsPopup}>
          <div className="booking-details-popup" onClick={e => e.stopPropagation()}>
            
            <button className="close-btn" onClick={closeDetailsPopup}>
              &times;
            </button>
            
            <h3>Booking ID: {selectedBooking.id}</h3>
            <p><strong>Booked on:</strong> {selectedBooking.createdAt}</p>
            <p><strong>User:</strong> {usersData[selectedBooking.uid]?.firstName} {usersData[selectedBooking.uid]?.lastName}</p>
            <p><strong>Technician:</strong> {usersData[selectedBooking.technicianId]?.firstName} {usersData[selectedBooking.technicianId]?.lastName}</p>
            <p><strong>Service:</strong> {selectedBooking.serviceName}</p>
            <p><strong>Description:</strong> {selectedBooking.description}</p>
            <p><strong>Date:</strong> {selectedBooking.date}</p>
            <p><strong>Timing:</strong> {selectedBooking.timing}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;