import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaMapMarkerAlt, FaBars, FaGlobeAmericas } from 'react-icons/fa';
import Search from './Search';
import './Navbar.css';

const Navbar = ({ onLogin, onSearch, isLoggedIn, user, onLogout, onLocationClick, onMenuClick, onZoomOut }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>WeatherApp</h2>
      </div>
      <div className="navbar-right">
        <div className="navbar-search">
          <Search onSearch={onSearch} />
          {isLoggedIn && user && (
            <>
              <motion.button
                className="location-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLocationClick}
                aria-label="Utiliser ma position"
                title="Utiliser ma position actuelle"
              >
                <FaMapMarkerAlt className="location-icon" />
              </motion.button>
              <motion.button
                className="zoom-out-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onZoomOut}
                aria-label="Vue globale"
                title="Vue globale"
              >
                <FaGlobeAmericas className="globe-icon" />
              </motion.button>
            </>
          )}
        </div>
        {isLoggedIn && user ? (
          <div className="user-info">
            <span className="user-name">{user.firstName || 'Utilisateur'}</span>
            <motion.button
              className="menu-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              aria-label="Menu utilisateur"
            >
              <FaBars className="menu-icon" />
            </motion.button>
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