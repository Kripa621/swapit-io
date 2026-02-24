import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import CreateListing from './pages/CreateListing';
import ItemDetails from './pages/ItemDetails';
import Dashboard from './pages/Dashboard';
import TradeRoom from './pages/TradeRoom';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trades/:id" element={<TradeRoom />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* NEW WALLET ROUTE */}
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;