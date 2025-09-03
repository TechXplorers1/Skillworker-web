import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';
import ServiceTechniciansPage from "./pages/ServiceTechniciansPage";

const App = () => {
  return (
      <><ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/services/:serviceName" element={<ServiceTechniciansPage />} />
      </Routes>
  </>
  );
};

export default App;
