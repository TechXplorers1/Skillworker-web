import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './pages/Homepage';
import ScrollToTop from './components/ScrollToTop';
import TechnicianRegistrationPrompt from "./components/TechnicianRegistrationPrompt";
import ServiceTechniciansPage from "./pages/ServiceTechniciansPage";
import ChatScreen from './components/ChatScreen';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
// import NotificationsPage from './components/NotificationsPage';
import MessageBox from './components/MessageBox';
import Profile from './components/Profile';
import ServiceRequests from "./pages/ServiceRequests";
import UserManagement from "./admin/UserManagement";
import TechnicianManagement from "./admin/TechnicianManagement";
import BookingManagement from "./admin/BookingManagement";
import ServiceManagement from "./admin/ServiceManagement";
import Settings from "./admin/Settings";
import Dashboard from "./admin/Dashboard";
import ForgotPassword from "./components/ForgotPassword";

const App = () => {
     return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/services/:serviceName" element={<ServiceTechniciansPage />} />
             <Route path="/chat/:chatId" element={<ChatScreen />} />
                <Route path="/booking/:serviceName/:technicianId" element={<BookingPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/technician-registration-prompt" element={<TechnicianRegistrationPrompt />} />
                {/* <Route path="/notifications" element={<NotificationsPage />} /> */}
                <Route path="/message-box" element={<MessageBox />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/service-requests" element={<ServiceRequests />} />
                <Route path="/user-management" element={<UserManagement />} />
                 <Route path="/booking-management" element={<BookingManagement />} />
                <Route path="/technician-management" element={<TechnicianManagement />} />
                   <Route path="/service-management" element={<ServiceManagement />} />
                   <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<Dashboard />} />
                   <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
        </>
    );
};

export default App;
