import React, { useState } from 'react';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion'; // Importation de Framer Motion
import { FaSearch } from 'react-icons/fa';  // Importation de l'icône de recherche de React Icons
import Search from './components/Search';
import WeatherDisplay from './components/WeatherDisplay';
import HourlyForecast from './components/HourlyForecast';
import Alert from './components/Alert';
import BackgroundGlobe from './components/BackgroundGlobe';

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globeCoords, setGlobeCoords] = useState({ lat: 0, lng: 0 });
  const [markers, setMarkers] = useState([]); // <-- nouveaux markers

  const handleSearch = async (cityName) => {
    setError(null);

    if (!cityName.trim()) {
      setError('Veuillez entrer un nom de ville');
      return;
    }

    const apiKey = process.env.REACT_APP_API_KEY;
    if (!apiKey) {
      setError('Configuration API manquante');
      return;
    }

    setLoading(true);
    try {
      // 1) météo courante
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&lang=fr&appid=${apiKey}`
      );
      const currentData = await currentRes.json();
      if (currentData.cod !== 200) {
        throw new Error(currentData.message || 'Ville non trouvée');
      }

      // 2) prévisions (toutes les 3h sur 5 jours)
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&lang=fr&appid=${apiKey}`
      );
      const forecastData = await forecastRes.json();
      if (forecastData.cod !== '200') {
        throw new Error(forecastData.message || 'Prévisions non disponibles');
      }

      // Mise à jour des états
      setWeather(currentData);
      setForecast(forecastData);
      setCity(cityName);
      setGlobeCoords({ lat: currentData.coord.lat, lng: currentData.coord.lon });
      setMarkers([{ lat: currentData.coord.lat, lng: currentData.coord.lon }]); // 💥 Ajout marker
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <BackgroundGlobe globeCoords={globeCoords} markers={markers} />

      <div className="content">
        <h1>WeatherApp</h1>
        <div className="search-container">
          <Search onSearch={handleSearch} />
          {/* Le deuxième bouton est supprimé */}
        </div>

        {loading && <div className="loading-spinner"></div>}
        {error && <div className="error">{error}</div>}

        <AnimatePresence exitBeforeEnter>
          {weather && forecast && (
            <motion.div
              key={city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <WeatherDisplay
                data={weather}
                city={city}
                forecast={forecast}
              />

              <div className="hourly-title">Prévisions horaires</div>

              <div className="hourly-forecast-container">
                <HourlyForecast forecast={forecast} />
              </div>

              {weather.alerts && <Alert alerts={weather.alerts} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
