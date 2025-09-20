import React, { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import '../styles/BookingManagement.css';

const BookingsManagement = () => {
  const [activeFilter, setActiveFilter] = useState('All Statuses');
  const [expandedBookings, setExpandedBookings] = useState({});
  const [bookingsData, setBookingsData] = useState([]);
  const [usersData, setUsersData] = useState({});
  
  useEffect(() => {
    const bookingsRef = ref(database, "bookings");
    onValue(bookingsRef, (snapshot) => {
      const bookings = snapshot.val();
      if (bookings) {
        const fetchedBookings = Object.keys(bookings).map(key => ({
          id: key,
          ...bookings[key]
        }));
        setBookingsData(fetchedBookings);
      }
    });

    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      setUsersData(snapshot.val() || {});
    });
  }, []);

  const statusFilters = ['All Statuses', 'pending', 'accepted', 'completed', 'cancelled'];

  const toggleDetails = (id) => {
    setExpandedBookings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
              <React.Fragment key={booking.id}>
                <tr>
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
                      onClick={() => toggleDetails(booking.id)}
                    >
                      {expandedBookings[booking.id] ? 'Hide Details' : 'Show Details'}
                    </button>
                  </td>
                </tr>
                {expandedBookings[booking.id] && (
                  <tr className="details-row">
                    <td colSpan="7">
                      <div className="booking-details">
                        <h3>Booking ID: {booking.id}</h3>
                        <p><strong>Booked on:</strong> {booking.createdAt}</p>
                        <p><strong>User:</strong> {usersData[booking.uid]?.firstName} {usersData[booking.uid]?.lastName}</p>
                        <p><strong>Technician:</strong> {usersData[booking.technicianId]?.firstName} {usersData[booking.technicianId]?.lastName}</p>
                        <p><strong>Service:</strong> {booking.serviceName}</p>
                        <p><strong>Description:</strong> {booking.description}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Timing:</strong> {booking.timing}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsManagement;