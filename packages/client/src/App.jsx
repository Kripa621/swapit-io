import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace'; // Import the new page
import CreateListing from './pages/CreateListing';
import ItemDetails from './pages/ItemDetails';
import Dashboard from './pages/Dashboard';
import TradeRoom from './pages/TradeRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Connected the real page */}
        <Route path="/marketplace" element={<Marketplace />} />
        
        {/* Placeholder for Detail Page */}
        <Route path="/items/:id" element={<ItemDetails />} />
        {/* Placeholder for Create Listing */}
        <Route path="/create-listing" element={<CreateListing />} />
        {/* New Route for Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* New Route for Trade Room */}
        <Route path="/trades/:id" element={<TradeRoom />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;