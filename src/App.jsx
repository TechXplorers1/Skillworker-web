import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';
import TechnicianRegistrationPrompt from "./components/TechnicianRegistrationPrompt";
import ServiceTechniciansPage from "./pages/ServiceTechniciansPage";
import ChatScreen from './components/ChatScreen';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BecomeTechnician from './components/BecomeTechnician'; 
import NotificationsPage from './components/NotificationsPage';
import MessageBox from './components/MessageBox';
import Profile from './components/Profile';
import ServiceRequests from "./pages/ServiceRequests";
// import UserManagement from "./admin/UserManagement";

const App = () => {
     return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/services/:serviceName" element={<ServiceTechniciansPage />} />
                <Route path="/chat/:chatType" element={<ChatScreen />} />
                <Route path="/booking/:serviceName/:technicianId" element={<BookingPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/become-technician" element={<BecomeTechnician />} />
                <Route path="/technician-registration-prompt" element={<TechnicianRegistrationPrompt />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/messages" element={<MessageBox />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/service-requests" element={<ServiceRequests />} />
                {/* <Route path="/user-management" element={<UserManagement />} /> */}
            </Routes>
        </>
    );
};

export default App;
