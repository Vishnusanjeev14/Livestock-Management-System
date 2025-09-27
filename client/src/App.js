import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Animals from './components/Animals';
import Breeding from './components/Breeding';
import Feeding from './components/Feeding';
import Health from './components/Health';
import Production from './components/Production';
import Veterinary from './components/Veterinary';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import Finance from './components/Finance';
import Staff from './components/Staff';
import Environment from './components/Environment';
import Scheduler from './components/Scheduler';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/animals" element={
              <ProtectedRoute>
                <Navbar />
                <Animals />
              </ProtectedRoute>
            } />
            
            <Route path="/breeding" element={
              <ProtectedRoute>
                <Navbar />
                <Breeding />
              </ProtectedRoute>
            } />
            
            <Route path="/feeding" element={
              <ProtectedRoute>
                <Navbar />
                <Feeding />
              </ProtectedRoute>
            } />
            
            <Route path="/health" element={
              <ProtectedRoute>
                <Navbar />
                <Health />
              </ProtectedRoute>
            } />
            
            <Route path="/production" element={
              <ProtectedRoute>
                <Navbar />
                <Production />
              </ProtectedRoute>
            } />
            
            <Route path="/veterinary" element={
              <ProtectedRoute>
                <Navbar />
                <Veterinary />
              </ProtectedRoute>
            } />
            
            <Route path="/sales" element={
              <ProtectedRoute>
                <Navbar />
                <Sales />
              </ProtectedRoute>
            } />
            
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Navbar />
                <Inventory />
              </ProtectedRoute>
            } />
            
            <Route path="/finance" element={
              <ProtectedRoute>
                <Navbar />
                <Finance />
              </ProtectedRoute>
            } />
            
            <Route path="/staff" element={
              <ProtectedRoute>
                <Navbar />
                <Staff />
              </ProtectedRoute>
            } />
            
            <Route path="/environment" element={
              <ProtectedRoute>
                <Navbar />
                <Environment />
              </ProtectedRoute>
            } />
            
            <Route path="/scheduler" element={
              <ProtectedRoute>
                <Navbar />
                <Scheduler />
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
