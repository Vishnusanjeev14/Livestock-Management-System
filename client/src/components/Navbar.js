import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', color: '#007bff' },
    { path: '/animals', label: 'Animals', color: '#28a745' },
    { path: '/breeding', label: 'Breeding', color: '#ffc107' },
    { path: '/feeding', label: 'Feeding', color: '#17a2b8' },
    { path: '/health', label: 'Health', color: '#dc3545' },
    { path: '/production', label: 'Production', color: '#6f42c1' },
    { path: '/veterinary', label: 'Veterinary', color: '#fd7e14' },
    { path: '/sales', label: 'Sales', color: '#20c997' },
    { path: '/inventory', label: 'Inventory', color: '#6c757d' },
    { path: '/finance', label: 'Finance', color: '#e83e8c' },
    { path: '/staff', label: 'Staff', color: '#17a2b8' },
    { path: '/environment', label: 'Environment', color: '#6f42c1' },
    { path: '/scheduler', label: 'Scheduler', color: '#ffc107' }
  ];

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <div className="navbar-header">
          <Link to="/dashboard" className="navbar-brand">
            <span className="brand-text">Livestock Management System</span>
          </Link>
          <button className="menu-toggle" onClick={toggleMenu}>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="menu-items">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive(item.path)}`}
                style={{ '--item-color': item.color }}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="menu-label">{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
