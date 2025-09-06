import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/DateTimeSelection.css';

const DateTimeSelection = () => {
  const { serviceName, technicianId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('2:00 PM');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Generate dates for the next 7 days
  const getDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      dates.push({
        id: i,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: date
      });
    }
    
    return dates;
  };

  const timeSlots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

  const handleBack = () => {
    navigate(-1);
  };

  const handleConfirm = () => {
    // Save the selected date and time, then navigate back to confirmation
    navigate(`/booking/${serviceName}/${technicianId}`);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.label);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  return (
    <div className="datetime-selection-container">
      <Header />
      
      <div className="datetime-main-content">
        <div className="back-nav">
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="datetime-content">
          <div className="datetime-header">
            <h1>Select Date & Time</h1>
          </div>

          <div className="dates-section">
            <h3>Available Dates</h3>
            <div className="dates-grid">
              {getDates().map((date) => (
                <div
                  key={date.id}
                  className={`date-card ${selectedDate === date.label ? 'selected' : ''}`}
                  onClick={() => handleDateSelect(date)}
                >
                  <span className="date-label">{date.label}</span>
                  <span className="date-full">{date.fullDate}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="times-section">
            <h3>Available Times</h3>
            <div className="times-grid">
              {timeSlots.map((time, index) => (
                <div
                  key={index}
                  className={`time-card ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

          <div className="instructions-section">
            <h3>Special Instructions (Optional)</h3>
            <textarea
              placeholder="Any specific requirements or details about the job..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="instructions-input"
            />
          </div>

          <div className="customer-info-review">
            <div className="info-card">
              <h4>Customer Information</h4>
              <p>John Customer</p>
              <p>+1 (234) 567-8900</p>
              <p>123 Main St, City, State</p>
            </div>
          </div>

          <div className="datetime-actions">
            <button className="confirm-btn" onClick={handleConfirm}>
              Confirm Selection
            </button>
            <button className="cancel-btn" onClick={handleBack}>
              Cancel
            </button>
          </div>

          <div className="support-section">
            <div className="guarantee-badge">
              <h4>100% Satisfaction Guarantee</h4>
              <p>Your service is protected by our quality guarantee</p>
            </div>
            
            <div className="support-info">
              <h4>Need Help?</h4>
              <p>Call Support: +1 (234) 567-8900</p>
              <p>Live Chat Support Available</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DateTimeSelection;