import React, { useState } from 'react';
import { FaStar, FaFlag, FaFileAlt, FaThumbsUp, FaThumbsDown, FaUser } from 'react-icons/fa';
import './UserMenu.css';

const UserMenu = ({ user, isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reportText, setReportText] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const handleRating = (value) => {
    setRating(value);
    // Ici, vous pouvez ajouter la logique pour envoyer la note au backend
  };

  const handleReport = async (e) => {
    e.preventDefault();
    // Logique pour envoyer le rapport à l'admin
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: reportText,
          type: 'error',
          userId: user._id
        })
      });
      if (response.ok) {
        setReportText('');
        setShowReportForm(false);
        // Afficher un message de succès
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport:', error);
    }
  };

  const handleReaction = async (reportId, type) => {
    try {
      await fetch(`http://localhost:5000/api/reports/${reportId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reaction: type })
      });
      // Mettre à jour l'interface utilisateur
    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-menu">
      <div className="user-menu-header">
        <FaUser /> {user.firstName} {user.lastName}
      </div>
      
      <div className="user-menu-content">
        {/* Section Notation */}
        <div className="menu-item" onClick={() => setShowRatingForm(!showRatingForm)}>
          <FaStar /> Noter la plateforme
        </div>
        {showRatingForm && (
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
        )}

        {/* Section Signalement */}
        <div className="menu-item" onClick={() => setShowReportForm(!showReportForm)}>
          <FaFlag /> Signaler un problème
        </div>
        {showReportForm && (
          <form onSubmit={handleReport} className="report-form">
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Décrivez le problème..."
            />
            <button type="submit">Envoyer</button>
          </form>
        )}

        {/* Section Rapports (visible pour tous) */}
        <div className="menu-item">
          <FaFileAlt /> Voir les rapports
        </div>

        {/* Section spécifique aux météorologues */}
        {user.role === 'meteorologist' && (
          <div className="menu-item">
            <FaFileAlt /> Générer un rapport
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu; 