import React from 'react';

function WeatherDisplay({ data }) {
  // Si les données météo sont présentes
  if (!data) return null;

  return (
    <div className="weather-display">
      <h2>{data.name}</h2> {/* Nom de la ville */}
      <p>{data.weather[0].description}</p> {/* Description de la météo (ex: Clear sky) */}
      <p>Temperature: {data.main.temp}°C</p> {/* Température en Celsius */}
      <p>Humidity: {data.main.humidity}%</p> {/* Humidité */}
      <p>Wind Speed: {data.wind.speed} m/s</p> {/* Vitesse du vent */}
    </div>
  );
}

export default WeatherDisplay;
