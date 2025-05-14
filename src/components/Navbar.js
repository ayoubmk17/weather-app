import React from 'react';
import { motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';
import Search from './Search';
import './Navbar.css';

const Navbar = ({ onLogin, onSearch }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>WeatherApp</h2>
      </div>
      <div className="navbar-right">
        <div className="navbar-search">
          <Search onSearch={onSearch} />
        </div>
        <motion.button
          className="login-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogin}
          aria-label="Se connecter"
        >
          <FaUser className="login-icon" />
        </motion.button>
      </div>
    </nav>
  );
};

export default Navbar; 