import React from 'react';

function Alert({ alerts }) {
  // Si aucune alerte n'est présente, ne rien afficher
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="alert-container">
      {alerts.map((alert, index) => (
        <div key={index} className="alert">
          <h3>{alert.event}</h3> {/* Titre de l'alerte (ex: Tempête imminente) */}
          <p>{alert.description}</p> {/* Description détaillée de l'alerte */}
        </div>
      ))}
    </div>
  );
}

export default Alert;
