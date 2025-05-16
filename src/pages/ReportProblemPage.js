import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Pages.css';

const ReportProblemPage = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
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
        // Vous pouvez ajouter ici un message de succès
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h2>Signaler un problème</h2>
        <div className="report-section">
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label htmlFor="report-type">Type de problème</label>
              <select
                id="report-type"
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
              <label htmlFor="report-title">Titre</label>
              <input
                id="report-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Résumé bref du problème"
                className="report-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="report-description">Description détaillée</label>
              <textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le problème en détail..."
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
                disabled={!title.trim() || !description.trim()}
              >
                Envoyer le rapport
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportProblemPage; 