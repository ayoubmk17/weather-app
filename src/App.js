import React, { useState } from 'react';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';
import WeatherDisplay from './components/WeatherDisplay';
import Alert from './components/Alert';
import BackgroundGlobe from './components/BackgroundGlobe';
import Navbar from './components/Navbar';

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globeCoords, setGlobeCoords] = useState({ lat: 0, lng: 0 });
  const [markers, setMarkers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // TODO: Implémenter la logique de connexion
    setIsLoggedIn(!isLoggedIn);
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

      <Navbar onLogin={handleLogin} onSearch={handleSearch} />

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