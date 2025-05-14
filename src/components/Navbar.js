import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import Search from './Search';
import './Navbar.css';

const Navbar = ({ onLogin, onSearch, isLoggedIn, user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>WeatherApp</h2>
      </div>
      <div className="navbar-right">
        <div className="navbar-search">
          <Search onSearch={onSearch} />
        </div>
        {isLoggedIn ? (
          <div className="user-info">
            <span className="user-name">{user?.firstName || 'Utilisateur'}</span>
            <motion.button
              className="logout-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              aria-label="Se déconnecter"
            >
              <FaSignOutAlt className="logout-icon" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            className="login-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogin}
            aria-label="Se connecter"
          >
            <FaUser className="login-icon" />
          </motion.button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 