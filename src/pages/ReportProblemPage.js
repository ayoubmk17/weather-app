import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Pages.css';

const ReportProblemPage = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          description,
          type
        })
      });

      if (response.ok) {
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'envoi du rapport');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h2>Signaler un problème</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="type">Type de problème</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="report-select"
            >
              <option value="bug">Bug technique</option>
              <option value="data">Données météo incorrectes</option>
              <option value="feature">Suggestion d'amélioration</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Résumé bref du problème"
              className="report-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description détaillée</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              className="report-textarea"
              required
            />
          </div>

          <div className="button-group">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || !title.trim() || !description.trim()}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportProblemPage; 