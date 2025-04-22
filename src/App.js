import React, { useState } from 'react';
import './App.css';
import Search from './components/Search';
import WeatherDisplay from './components/WeatherDisplay';
import Alert from './components/Alert';

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = (cityName) => {
    // Réinitialisation des états
    setError(null);
    
    // Validation
    if (!cityName || cityName.trim() === '') {
      setError('Veuillez entrer un nom de ville');
      return;
    }

    setLoading(true);

    const apiKey = process.env.REACT_APP_API_KEY;
    if (!apiKey) {
      setError('Configuration API manquante');
      setLoading(false);
      return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=fr`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.cod === 200) {
          setWeather(data);
          setCity(cityName);
        } else {
          setError(data.message || 'Ville non trouvée');
        }
      })
      .catch((error) => {
        setError('Erreur de connexion au service météo');
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="App">
      <h1>WeatherApp</h1>
      <Search onSearch={handleSearch} />
      
      {loading && <div className="loading">Chargement en cours...</div>}
      {error && <div className="error">{error}</div>}
      
      {weather && !error && (
        <>
          <WeatherDisplay data={weather} city={city} />
          {weather.alerts && <Alert alerts={weather.alerts} />}
        </>
      )}
    </div>
  );
}

export default App;