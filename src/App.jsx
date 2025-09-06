import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';
import ServiceTechniciansPage from "./pages/ServiceTechniciansPage";
import ChatScreen from './components/ChatScreen';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage'; // New Import

const App = () => {
    return (
        <><ScrollToTop />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/services/:serviceName" element={<ServiceTechniciansPage />} />
                <Route path="/chat/:serviceName/:technicianId" element={<ChatScreen />} />
                <Route path="/booking/:serviceName/:technicianId" element={<BookingPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} /> {/* New Route */}
            </Routes>
        </>
    );
};

export default App;