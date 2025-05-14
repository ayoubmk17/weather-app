import React, { useState } from 'react';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';
import WeatherDisplay from './components/WeatherDisplay';
import Alert from './components/Alert';
import BackgroundGlobe from './components/BackgroundGlobe';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globeCoords, setGlobeCoords] = useState({ lat: 0, lng: 0 });
  const [markers, setMarkers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = async (credentials, isSignUp) => {
    try {
      console.log('Tentative de connexion/inscription:', credentials);
      const endpoint = isSignUp ? 'register' : 'login';
      
      // Vérifier que le serveur est accessible
      try {
        await fetch('http://localhost:5000/api/test');
      } catch (error) {
        throw new Error('Le serveur n\'est pas accessible. Vérifiez que le backend est en cours d\'exécution.');
      }

      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      console.log('Réponse du serveur:', response.status);
      const data = await response.json();
      console.log('Données reçues:', data);

      if (response.ok) {
        // Stocker le token et les informations utilisateur
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        alert(isSignUp ? 'Inscription réussie !' : 'Connexion réussie !');
      } else {
        throw new Error(data.message || 'Une erreur est survenue lors de l\'authentification');
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      alert(error.message || 'Une erreur est survenue lors de la connexion');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleSearch = async (cityName) => {
    setError(null);
    if (!cityName.trim()) {
      setError('Veuillez entrer un nom de ville');
      return;
    }

    const apiKey = process.env.REACT_APP_API_KEY;
    if (!apiKey) {
      setError('Clé API manquante. Vérifiez votre configuration.');
      return;
    }

    setLoading(true);
    try {
      // 1. Récupération des données météo actuelles
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&lang=fr&appid=${apiKey}`
      );
      const currentData = await currentRes.json();
      
      if (currentData.cod !== 200) {
        throw new Error(currentData.message || 'Ville non trouvée');
      }

      // 2. Récupération des prévisions
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&lang=fr&appid=${apiKey}`
      );
      const forecastData = await forecastRes.json();
      
      if (forecastData.cod !== '200') {
        throw new Error(forecastData.message || 'Erreur lors de la récupération des prévisions');
      }

      // Mise à jour des états
      setWeather(currentData);
      setForecast(forecastData);
      setCity(cityName);
      setGlobeCoords({ 
        lat: currentData.coord.lat, 
        lng: currentData.coord.lon 
      });
      setMarkers([{ 
        lat: currentData.coord.lat, 
        lng: currentData.coord.lon,
        city: cityName 
      }]);

    } catch (err) {
      console.error('Erreur API:', err);
      setError(err.message || 'Une erreur est survenue');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <BackgroundGlobe 
        globeCoords={globeCoords} 
        markers={markers} 
      />

      <Navbar 
        onLogin={() => setIsLoginModalOpen(true)}
        onSearch={handleSearch}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <div className="content">
        {/* États de chargement et d'erreur */}
        {loading && (
          <motion.div
            className="loading-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner"></div>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Affichage des données météo */}
        <AnimatePresence mode="wait">
          {weather && forecast && (
            <motion.div
              key={city}
              className="weather-panels"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="left-panel">
                <WeatherDisplay 
                  data={weather} 
                  city={city} 
                  forecast={forecast} 
                />
              </div>

              <div className="right-panel">
                {weather.alerts && weather.alerts.length > 0 && (
                  <>
                    <h3>Alertes Météo</h3>
                    <Alert alerts={weather.alerts} />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;