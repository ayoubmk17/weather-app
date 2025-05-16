import React, { useState } from 'react';
import { FaFileAlt, FaCloudSun, FaDownload } from 'react-icons/fa';
import './Pages.css';

const GenerateReportPage = ({ onClose, user }) => {
  const [reportType, setReportType] = useState('daily');
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [parameters, setParameters] = useState({
    temperature: true,
    humidity: true,
    pressure: true,
    wind: true,
    precipitation: true
  });
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const response = await fetch('http://localhost:5000/api/weather-reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: reportType,
          location,
          dateRange,
          parameters,
          format
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-meteo-${location}-${dateRange.start}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h2>Générer un rapport météorologique</h2>
        
        <form onSubmit={handleSubmit} className="report-generation-form">
          <div className="form-group">
            <label htmlFor="report-type">Type de rapport</label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="report-select"
            >
              <option value="daily">Rapport journalier</option>
              <option value="weekly">Rapport hebdomadaire</option>
              <option value="monthly">Rapport mensuel</option>
              <option value="custom">Période personnalisée</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Localisation</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville ou région"
              required
              className="report-input"
            />
          </div>

          <div className="form-group date-range">
            <label>Période</label>
            <div className="date-inputs">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="date-input"
              />
              <span>à</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="date-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Paramètres à inclure</label>
            <div className="parameters-grid">
              {Object.entries(parameters).map(([key, value]) => (
                <label key={key} className="parameter-checkbox">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setParameters({
                      ...parameters,
                      [key]: e.target.checked
                    })}
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="format">Format du rapport</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="report-select"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={generating || !location}
            >
              {generating ? 'Génération...' : 'Générer le rapport'}
              {!generating && <FaDownload className="button-icon" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateReportPage; 