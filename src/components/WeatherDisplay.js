import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WeatherDisplay.css';
import { motion } from 'framer-motion';
import {
  WiThermometer,
  WiHumidity,
  WiStrongWind,
  WiDaySunny,
  WiRain,
  WiCloudy,
} from 'react-icons/wi';
import TempChart from './TempChart'; // Si vous avez un graphique de température personnalisé

function WeatherDisplay({ data, city, forecast }) {
  const [localTime, setLocalTime] = useState('');

  // Mise à jour de l'heure locale toutes les minutes
  useEffect(() => {
    if (typeof data.timezone !== 'number') return;
    const update = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const cityDate = new Date(utc + data.timezone * 1000);
      setLocalTime(
        cityDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const timerId = setInterval(update, 60000); // Mise à jour chaque minute
    return () => clearInterval(timerId);
  }, [data.timezone]);

  if (!data || !data.weather || !data.main || !data.wind) {
    return <div className="error-message">Données météo non disponibles</div>;
  }

  // Fonction pour obtenir l'icône de météo
  const getWeatherIcon = (id) => {
    if (id >= 200 && id < 300) return <WiRain className="weather-main-icon" />;
    if (id >= 300 && id < 600) return <WiRain className="weather-main-icon" />;
    if (id >= 600 && id < 700) return <WiRain className="weather-main-icon" />;
    if (id >= 700 && id < 800) return <WiCloudy className="weather-main-icon" />;
    if (id === 800) return <WiDaySunny className="weather-main-icon" />;
    return <WiCloudy className="weather-main-icon" />;
  };

  // Prévision actuelle
  const currentForecast = forecast?.list?.[0];

  // Prévisions journalières (7 jours)
  const dailyForecast = [];
  if (forecast && forecast.list) {
    const today = new Date().getDate();
    const seen = new Set();
    for (const item of forecast.list) {
      const d = new Date(item.dt_txt);
      const day = d.getDate();
      if (day !== today && !seen.has(day)) {
        dailyForecast.push(item);
        seen.add(day);
      }
      if (dailyForecast.length === 7) break;
    }
  }

  return (
    <div className="weather-info-container">
      <h2>{city}</h2>
      <div className="local-time">Heure locale : {localTime}</div>

      {/* Météo actuelle */}
      <div className="weather-main">
        {getWeatherIcon(data.weather[0].id)}
        <p className="temperature">{Math.round(data.main.temp)}°C</p>
      </div>
      <p className="weather-description">{data.weather[0].description}</p>

      {/* Prévision actuelle */}
      {currentForecast && (
        <div className="current-forecast">
          <h3>Prévision actuelle :</h3>
          <p>
            {getWeatherIcon(currentForecast.weather[0].id)}
            {Math.round(currentForecast.main.temp)}°C
          </p>
          <p>{currentForecast.weather[0].description}</p>
        </div>
      )}

      {/* Détails météo */}
      <div className="weather-details">
        <div className="weather-card">
          <WiThermometer className="weather-icon" />
          <p>Température</p>
          <p className="weather-value">{Math.round(data.main.temp)}°C</p>
          <p className="weather-minmax">
            Max: {Math.round(data.main.temp_max)}°C / Min: {Math.round(data.main.temp_min)}°C
          </p>
        </div>
        <div className="weather-card">
          <WiHumidity className="weather-icon" />
          <p>Humidité</p>
          <p className="weather-value">{data.main.humidity}%</p>
        </div>
        <div className="weather-card">
          <WiStrongWind className="weather-icon" />
          <p>Vent</p>
          <p className="weather-value">{data.wind.speed} m/s</p>
          {data.wind.gust && <p className="weather-gust">Rafales: {data.wind.gust} m/s</p>}
        </div>
      </div>

      {/* Prévisions sur 7 jours */}
      {dailyForecast.length > 0 && (
        <div className="forecast-container">
          <h3>Prévisions sur 7 jours</h3>
          <div className="forecast-cards">
            {dailyForecast.map((day, index) => (
              <motion.div
                className="forecast-card"
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <p className="forecast-date">
                  {new Date(day.dt_txt).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                {getWeatherIcon(day.weather[0].id)}
                <p className="forecast-temp">{Math.round(day.main.temp)}°C</p>
                <p className="forecast-desc">{day.weather[0].description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique des températures */}
      {dailyForecast.length > 0 && (
        <div className="temp-chart-container">
          <h3 className="temp-chart-title">Évolution des températures</h3>
          <TempChart data={dailyForecast} />
        </div>
      )}
    </div>
  );
}

WeatherDisplay.propTypes = {
  data: PropTypes.shape({
    weather: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.number, description: PropTypes.string })
    ).isRequired,
    main: PropTypes.shape({
      temp: PropTypes.number,
      temp_min: PropTypes.number,
      temp_max: PropTypes.number,
      humidity: PropTypes.number,
    }).isRequired,
    wind: PropTypes.shape({ speed: PropTypes.number, gust: PropTypes.number }).isRequired,
    timezone: PropTypes.number.isRequired,
  }).isRequired,
  city: PropTypes.string.isRequired,
  forecast: PropTypes.shape({
    list: PropTypes.arrayOf(
      PropTypes.shape({
        dt_txt: PropTypes.string,
        main: PropTypes.shape({ temp: PropTypes.number }),
        weather: PropTypes.arrayOf(
          PropTypes.shape({ id: PropTypes.number, description: PropTypes.string })
        ),
      })
    ),
  }).isRequired,
};

export default WeatherDisplay;
