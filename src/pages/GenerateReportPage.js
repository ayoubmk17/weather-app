import React, { useState } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import './Pages.css';

const GenerateReportPage = ({ onClose, user }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification non trouvé');
      }

      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          location,
          type
        })
      });

      if (response.ok) {
        onClose();
      } else {
        const data = await response.json();
        console.error('Erreur serveur:', data);
        throw new Error(data.message || `Erreur lors de la création du rapport (${response.status})`);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.message || 'Une erreur est survenue lors de la création du rapport');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h2>Créer un rapport météorologique</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="title">Titre du rapport</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du rapport"
              required
              className="report-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Localisation</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville ou région concernée"
              required
              className="report-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type de rapport</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="report-select"
            >
              <option value="daily">Rapport journalier</option>
              <option value="weekly">Rapport hebdomadaire</option>
              <option value="monthly">Rapport mensuel</option>
              <option value="special">Rapport spécial</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenu du rapport</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez votre rapport ici..."
              className="report-textarea"
              required
            />
          </div>

          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || !content || !title || !location}
            >
              {isSubmitting ? 'Création...' : 'Créer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateReportPage; 