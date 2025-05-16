import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import './Pages.css';

const RatingPage = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating,
          comment
        })
      });

      if (response.ok) {
        onClose();
        // Vous pouvez ajouter ici un message de succès
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notation:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h2>Noter l'application</h2>
        <div className="rating-section">
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          <form onSubmit={handleSubmit} className="rating-form">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience (optionnel)"
              className="rating-comment"
            />
            <div className="button-group">
              <button type="button" onClick={onClose} className="cancel-button">
                Annuler
              </button>
              <button type="submit" className="submit-button" disabled={!rating}>
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingPage; 