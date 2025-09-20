import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, database } from "../firebase";
import '../styles/NotificationsPage.css';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const notificationsRef = ref(database, `notifications/${user.uid}`);
                const unsubscribeDB = onValue(notificationsRef, (snapshot) => {
                    const notificationsData = snapshot.val();
                    if (notificationsData) {
                        const loadedNotifications = Object.keys(notificationsData).map(key => ({
                            id: key,
                            ...notificationsData[key]
                        }));
                        setNotifications(loadedNotifications);
                    } else {
                        setNotifications([]);
                    }
                    setLoading(false);
                });
                return () => unsubscribeDB();
            } else {
                setLoading(false);
                setNotifications([]);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    if (loading) {
        return <div>Loading notifications...</div>;
    }

    return (
        <div className="notifications-page-container">
            <Header />
            <main className="notifications-main-content">
                <div className="notifications-list">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
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
                        ))
                    ) : (
                        <div className="no-notifications-message">
                            <p>You have no new notifications.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotificationsPage;