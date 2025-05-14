import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Toast.css';

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`toast ${type}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="toast-content">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 