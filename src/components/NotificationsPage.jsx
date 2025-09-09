import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaChevronLeft, FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/NotificationsPage.css';

const notificationsData = [
    {
        id: 1,
        type: 'info',
        title: 'New Feature Alert',
        message: 'You can now book technicians with our new rating and review system. Check it out!',
        time: '2 hours ago'
    },
    {
        id: 2,
        type: 'success',
        title: 'Booking Confirmed',
        message: 'Your plumbing service with Alex Thompson has been confirmed for tomorrow at 10 AM.',
        time: '3 hours ago'
    },
    {
        id: 3,
        type: 'warning',
        title: 'Payment Reminder',
        message: 'Your payment for the electrical work is due in 24 hours. Please complete the transaction.',
        time: '1 day ago'
    },
    {
        id: 4,
        type: 'info',
        title: 'Service Completed',
        message: 'The house cleaning service has been marked as completed. Please leave a review!',
        time: '2 days ago'
    },
    {
        id: 5,
        type: 'success',
        title: 'New Message',
        message: 'You have a new message from a technician. Tap to view the conversation.',
        time: '3 days ago'
    },
];

const NotificationsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="notifications-page-container">
            <Header />
            <main className="notifications-main-content">
                
                <div className="notifications-list">
                    {notificationsData.map(notification => (
                        <div key={notification.id} className={`notification-card ${notification.type}`}>
                            <div className="notification-icon">
                                {notification.type === 'info' && <FaInfoCircle />}
                                {notification.type === 'success' && <FaCheckCircle />}
                                {notification.type === 'warning' && <FaExclamationCircle />}
                            </div>
                            <div className="notification-content">
                                <h3 className="notification-title">{notification.title}</h3>
                                <p className="notification-message">{notification.message}</p>
                                <span className="notification-time">{notification.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotificationsPage;