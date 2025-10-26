import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Skills from './pages/Skills';
import AssessmentsPage from './pages/Assessments';
import Resume from './pages/Resume';
import SupportPage from './pages/SupportPage';

function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/support" element={<SupportPage />} />

      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
