import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import RequestLeave from './components/RequestLeave';
import LeaveHistory from './components/LeaveHistory';
import Profile from './components/Profile';
import Settings from './components/Settings';
import LeaveRequestDetails from './components/LeaveRequestDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/request-leave" element={<RequestLeave />} />
          <Route path="/employee/leave-history" element={<LeaveHistory />} />
          <Route path="/employee/profile" element={<Profile />} />
          <Route path="/employee/settings" element={<Settings />} />
          <Route path="/employee/leave-request/:id" element={<LeaveRequestDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;