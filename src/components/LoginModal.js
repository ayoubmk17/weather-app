import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('user');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      onLogin({ email, password, firstName, lastName, role }, isSignUp);
    } else {
      onLogin({ email, password }, isSignUp);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setRole('user');
  };

  const handleSwitchMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="content">
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              // Empêcher la propagation du clic sur l'overlay
              e.stopPropagation();
              onClose();
            }}
          >
            <motion.div
              className="login-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()} // Empêcher la fermeture lors du clic sur le modal
            >
              <button className="close-button" onClick={onClose}>
                <FaTimes />
              </button>
              
              <h2>{isSignUp ? 'Créer un compte' : 'Se connecter'}</h2>
              
              <form onSubmit={handleSubmit}>
                {isSignUp && (
                  <>
                    <div className="form-group">
                      <div className="input-icon">
                        <FaUser />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Prénom"
                          required={isSignUp}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="input-icon">
                        <FaUser />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Nom"
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <div className="input-icon">
                    <FaEnvelope />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-icon">
                    <FaLock />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe"
                      required
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div className="form-group">
                    <div className="role-selector">
                      <label>Rôle :</label>
                      <div className="role-options">
                        <label className="role-option">
                          <input
                            type="radio"
                            name="role"
                            value="user"
                            checked={role === 'user'}
                            onChange={(e) => setRole(e.target.value)}
                          />
                          <span>Utilisateur</span>
                        </label>
                        <label className="role-option">
                          <input
                            type="radio"
                            name="role"
                            value="meteorologist"
                            checked={role === 'meteorologist'}
                            onChange={(e) => setRole(e.target.value)}
                          />
                          <span>Météorologue</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="submit-button">
                  {isSignUp ? "S'inscrire" : 'Se connecter'}
                </button>
              </form>

              <p className="switch-mode">
                {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
                <button
                  className="switch-button"
                  onClick={handleSwitchMode}
                >
                  {isSignUp ? 'Se connecter' : "S'inscrire"}
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal; 