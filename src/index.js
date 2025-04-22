import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Votre fichier de styles global
import App from './App';  // Le composant principal de l'application
import reportWebVitals from './reportWebVitals';  // Un module pour mesurer les performances (vous pouvez l'ignorer pour l'instant)

const root = ReactDOM.createRoot(document.getElementById('root')); // Création du root dans l'élément HTML avec l'ID 'root'

root.render(
  <React.StrictMode>  {/* React Strict Mode est un outil pour détecter les problèmes dans l'application */}
    <App />
  </React.StrictMode>
);

// Code pour mesurer les performances (vous pouvez l'ignorer pour l'instant)
reportWebVitals();
