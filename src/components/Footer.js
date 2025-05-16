import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="copyright">
          © {new Date().getFullYear()} - Développé par{' '}
          <span className="authors">Ayoub Mourfik</span> &{' '}
          <span className="authors">Ilyas Belayachi</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer; 