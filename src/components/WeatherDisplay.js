import React, { useEffect, useState } from "react";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiStrongWind,
  WiHumidity,
  WiBarometer,
} from "react-icons/wi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./WeatherDisplay.css";

const WeatherDisplay = ({ data, forecast }) => {
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    if (data?.timezone) {
      const now = new Date();
      const localTimeString = new Date(
        now.getTime() + data.timezone * 1000
      ).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      setLocalTime(localTimeString);
    }
  }, [data]);

  // Vérification des données
  if (!data || !data.weather || !data.main || !forecast || !forecast.list) {
    return <div className="loading">Chargement des données météo...</div>;
  }

  // Prévisions horaires (6 prochaines heures)
  const hourly = forecast.list.slice(0, 6).map((hour) => ({
    dt: hour.dt,
    temp: hour.main.temp,
    main: hour.weather[0].main,
  }));

  // Prévisions journalières (7 jours à midi)
  const daily = forecast.list
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .slice(0, 7)
    .map((day) => ({
      dt: day.dt,
      temp: day.main.temp,
      main: day.weather[0].main,
    }));

  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear":
        return <WiDaySunny className="weather-main-icon" />;
      case "Clouds":
        return <WiCloud className="weather-main-icon" />;
      case "Rain":
        return <WiRain className="weather-main-icon" />;
      case "Snow":
        return <WiSnow className="weather-main-icon" />;
      case "Thunderstorm":
        return <WiThunderstorm className="weather-main-icon" />;
      default:
        return <WiDaySunny className="weather-main-icon" />;
    }
  };

  return (
    <div className="weather-display">
      {/* Partie gauche */}
      <div className="weather-left">
        <div className="weather-info-container animate-fade-in">
          <div className="weather-main">
            {getWeatherIcon(data.weather[0].main)}
            <div className="temperature">{Math.round(data.main.temp)}°C</div>
            <div className="weather-description">{data.weather[0].description}</div>
            <div className="local-time">Heure locale : {localTime}</div>
          </div>
          <div className="weather-details horizontal">
            <div className="weather-card">
              <WiHumidity className="weather-icon" />
              <div className="weather-value">{data.main.humidity}%</div>
            </div>
            <div className="weather-card">
              <WiStrongWind className="weather-icon" />
              <div className="weather-value">{data.wind.speed} m/s</div>
            </div>
            <div className="weather-card">
              <WiBarometer className="weather-icon" />
              <div className="weather-value">{data.main.pressure} hPa</div>
            </div>
          </div>
          <div className="hourly-forecast">
            <h3>Prévisions horaires</h3>
            <div className="hourly-scroll">
              {hourly.map((hour, i) => (
                <div className="hourly-item" key={i}>
                  <p>{new Date(hour.dt * 1000).getHours()}h</p>
                  {getWeatherIcon(hour.main)}
                  <p>{Math.round(hour.temp)}°C</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Espace central */}
      <div className="weather-spacer"></div>

      {/* Partie droite */}
      <div className="weather-right animate-slide-in">
        <div className="forecast-section">
          <h3>Prévisions sur 7 jours</h3>
          <div className="forecast-cards">
            {daily.map((day, i) => (
              <div className="forecast-card" key={i}>
                <div className="forecast-date">
                  {new Date(day.dt * 1000).toLocaleDateString("fr-FR", { weekday: "short" })}
                </div>
                {getWeatherIcon(day.main)}
                <div className="forecast-temp">{Math.round(day.temp)}°C</div>
              </div>
            ))}
          </div>
        </div>
        <div className="temp-chart-container">
          <div className="temp-chart-title">Évolution des températures</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={daily.map((d) => ({
                name: new Date(d.dt * 1000).toLocaleDateString("fr-FR", { weekday: "short" }),
                temp: d.temp,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#ffcc00" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;