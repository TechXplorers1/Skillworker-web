import React, { useState } from 'react';
import '../styles/BookingManagement.css';

const BookingsManagement = () => {
  const [activeFilter, setActiveFilter] = useState('All Statuses');
  const [expandedBookings, setExpandedBookings] = useState({});

  // Sample booking data
  const bookingsData = [
    {
      id: '-OZtKxnLlevcR4749oqX',
      bookedOn: '11/09/2025 20:44',
      user: 'chaveen reddy',
      technician: 'Gopi Ravi',
      service: 'Electrician',
      status: 'Active',
      amount: '$120',
      date: '2025-09-11',
      issue: '',
      timing: ''
    },
    {
      id: '-OZnAz9rkMm637NHfnPx',
      bookedOn: '10/09/2025 16:03',
      user: 'chaveen reddy',
      technician: 'Sandy Sandy',
      service: 'Electrician',
      status: 'Accepted',
      amount: '$150',
      date: '2025-09-10',
      issue: 'Electrical wiring issue',
      timing: 'Afternoon (12:00 PM - 3:00 PM)'
    },
    {
      id: '-OZkLmNopQrS12345678',
      bookedOn: '12/09/2025 10:15',
      user: 'John Customer',
      technician: 'Alex Technician',
      service: 'Plumbing',
      status: 'Completed',
      amount: '$200',
      date: '2025-09-12',
      issue: 'Leaking pipe in kitchen',
      timing: 'Morning (9:00 AM - 12:00 PM)'
    },
    {
      id: '-OZaBcDeFgHi98765432',
      bookedOn: '09/09/2025 14:30',
      user: 'Sarah Smith',
      technician: 'Mike Mechanic',
      service: 'Electrical',
      status: 'Cancelled',
      amount: '$0',
      date: '2025-09-09',
      issue: 'Outlet not working',
      timing: 'Evening (3:00 PM - 6:00 PM)'
    }
  ];

  const statusFilters = ['All Statuses', 'Active', 'Accepted', 'Completed', 'Cancelled'];

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
              <th>Amount</th>
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
                      <div className="customer-name">{booking.user}</div>
                    </div>
                  </td>
                  <td>{booking.technician}</td>
                  <td>{booking.service}</td>
                  <td>
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>{booking.amount}</td>
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
                        <p><strong>Booked on:</strong> {booking.bookedOn}</p>
                        <p><strong>User:</strong> {booking.user}</p>
                        <p><strong>Technician:</strong> {booking.technician}</p>
                        <p><strong>Service:</strong> {booking.service}</p>
                        {booking.issue && (
                          <>
                            <p><strong>Issue:</strong> {booking.issue}</p>
                            <p><strong>Date:</strong> {booking.date}</p>
                            <p><strong>Timing:</strong> {booking.timing}</p>
                          </>
                        )}
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