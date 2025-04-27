import React from 'react';
import PropTypes from 'prop-types';
import './HourlyForecast.css';
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
  WiFog
} from 'react-icons/wi';

export default function HourlyForecast({ forecast }) {
  if (!forecast || !forecast.list) return null;

  // On prend les 8 prochaines prévisions (24 heures, toutes les 3 h)
  const nextHours = forecast.list.slice(0, 8);

  // Choix de l'icône selon l'ID
  const getIcon = (id) => {
    if (id >= 200 && id < 300) return <WiThunderstorm />;
    if (id >= 300 && id < 600) return <WiRain />;
    if (id >= 600 && id < 700) return <WiSnow />;
    if (id >= 700 && id < 800) return <WiFog />;
    if (id === 800) return <WiDaySunny />;
    return <WiCloudy />;
  };

  return (
    <div className="hourly-forecast">
      {nextHours.map((f, idx) => {
        const date = new Date(f.dt_txt);
        const timeStr = date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return (
          <div className="hourly-card" key={idx}>
            <p className="hour">{timeStr}</p>
            <div className="icon">{getIcon(f.weather[0].id)}</div>
            <p className="temp">{Math.round(f.main.temp)}°C</p>
          </div>
        );
      })}
    </div>
  );
}

HourlyForecast.propTypes = {
  forecast: PropTypes.shape({
    list: PropTypes.arrayOf(PropTypes.shape({
      dt_txt: PropTypes.string.isRequired,
      main: PropTypes.shape({ temp: PropTypes.number.isRequired }).isRequired,
      weather: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.number.isRequired })
      ).isRequired
    }))
  }).isRequired
};