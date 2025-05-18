import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';
import WeatherDisplay from './components/WeatherDisplay';
import Alert from './components/Alert';
import BackgroundGlobe from './components/BackgroundGlobe';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import Toast from './components/Toast';
import UserMenu from './components/UserMenu';
import Footer from './components/Footer';

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [userLocation, setUserLocation] = useState(null);
  const [handleZoomOut, setHandleZoomOut] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsLoggedIn(true);
          } else {
            // Si le token n'est plus valide, on déconnecte l'utilisateur
            localStorage.removeItem('token');
            setUser(null);
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du token:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    };

    checkAuth();
  }, []);

  const zoomOutRef = useCallback((zoomOutFn) => {
    setHandleZoomOut(() => zoomOutFn);
  }, []);

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
    // Fermer le menu utilisateur s'il est ouvert
    setIsUserMenuOpen(false);
    
    // Nettoyer les données utilisateur
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    
    // Afficher le toast de déconnexion
    showToast('Déconnexion réussie !', 'success');
    
    // Réinitialiser les autres états si nécessaire
    setWeather(null);
    setForecast(null);
    setCity('');
    setUserLocation(null);
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          const apiKey = process.env.REACT_APP_API_KEY;
          try {
            // Récupération directe des données météo par coordonnées
            const weatherResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${apiKey}`
            );
            const weatherData = await weatherResponse.json();
            
            if (weatherData.cod === 200) {
              setWeather(weatherData);
              
              // Obtenir les prévisions
              const forecastRes = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${apiKey}`
              );
              const forecastData = await forecastRes.json();
              
              if (forecastData.cod === '200') {
                setForecast(forecastData);
                setCity(weatherData.name); // Utiliser le nom de la ville des données météo
                setGlobeCoords({ lat: latitude, lng: longitude });
                setMarkers([{ 
                  lat: latitude,
                  lng: longitude,
                  city: weatherData.name
                }]);
                showToast(`Météo chargée pour ${weatherData.name}`);
              }
            } else {
              throw new Error('Erreur lors de la récupération des données météo');
            }
          } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur lors de la récupération des données météo', 'error');
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          let message = 'Impossible d\'obtenir votre position';
          if (error.code === 1) {
            message = 'Veuillez autoriser l\'accès à votre position';
          }
          showToast(message, 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
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
      setCity(cityName); // Utiliser le nom de ville saisi par l'utilisateur
      setGlobeCoords({ 
        lat: currentData.coord.lat, 
        lng: currentData.coord.lon 
      });
      setMarkers([{ 
        lat: currentData.coord.lat, 
        lng: currentData.coord.lon,
        city: cityName // Utiliser le nom de ville saisi par l'utilisateur
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
        onZoomOutRef={zoomOutRef}
      />

      <Navbar 
        onLogin={() => setIsLoginModalOpen(true)}
        onSearch={handleSearch}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        onLocationClick={getUserLocation}
        onMenuClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        onZoomOut={handleZoomOut}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <UserMenu
        user={user}
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
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

      <Footer />
    </div>
  );
}

export default App;