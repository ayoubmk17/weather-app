import React, { useState, useEffect } from 'react';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';
import WeatherDisplay from './components/WeatherDisplay';
import Alert from './components/Alert';
import BackgroundGlobe from './components/BackgroundGlobe';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import Toast from './components/Toast';

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
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [userLocation, setUserLocation] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleLogin = async (credentials, isSignUp) => {
    try {
      console.log('Tentative de connexion/inscription:', credentials);
      const endpoint = isSignUp ? 'register' : 'login';
      
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        showToast(isSignUp ? 'Inscription réussie ! Bienvenue !' : 'Connexion réussie !');
        // Demander la géolocalisation après la connexion réussie
        getUserLocation();
      } else {
        throw new Error(data.message || 'Une erreur est survenue lors de l\'authentification');
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      showToast(error.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    showToast('Déconnexion réussie !');
  };

  // Fonction pour obtenir la ville à partir des coordonnées
  const getCityFromCoords = async (lat, lon) => {
    const apiKey = process.env.REACT_APP_API_KEY;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
      );
      const data = await response.json();
      if (data && data[0]) {
        return data[0].name;
      }
      throw new Error('Ville non trouvée');
    } catch (error) {
      console.error('Erreur lors de la récupération de la ville:', error);
      return null;
    }
  };

  const getUserLocation = () => {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn || !user) {
      showToast('Veuillez vous connecter pour utiliser la géolocalisation', 'error');
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Obtenir le nom de la ville
          const cityName = await getCityFromCoords(latitude, longitude);
          if (cityName) {
            handleSearch(cityName);
            showToast(`Météo chargée pour ${cityName}`);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          showToast('Impossible d\'obtenir votre position', 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      showToast('La géolocalisation n\'est pas supportée par votre navigateur', 'error');
    }
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
        onLocationClick={getUserLocation}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <Toast 
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
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