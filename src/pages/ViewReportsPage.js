import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaEye, FaDownload, FaSort } from 'react-icons/fa';
import './Pages.css';

const ViewReportsPage = ({ onClose, user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchReports();
  }, [filter, sortBy, sortOrder]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports?filter=${filter}&sortBy=${sortBy}&order=${sortOrder}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        throw new Error('Erreur lors de la récupération des rapports');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDownload = (report) => {
    // Créer un fichier texte du rapport
    const reportContent = `
Rapport Météorologique
=====================

Titre: ${report.title}
Type: ${getReportTypeLabel(report.type)}
Localisation: ${report.location}
Date: ${formatDate(report.createdAt)}
Auteur: ${report.author ? `${report.author.firstName} ${report.author.lastName}` : 'Auteur inconnu'}

Contenu:
--------
${report.content}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTypeLabel = (type) => {
    const types = {
      daily: 'Journalier',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      special: 'Spécial'
    };
    return types[type] || type;
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h2>Rapports Météorologiques</h2>
        
        {error && <div className="error-message">{error}</div>}

        <div className="reports-controls">
          <div className="filter-section">
            <label htmlFor="filter">Type de rapport:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="report-select"
            >
              <option value="all">Tous</option>
              <option value="daily">Journalier</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
              <option value="special">Spécial</option>
            </select>
          </div>

          <div className="sort-buttons">
            <button
              onClick={() => handleSort('date')}
              className={`sort-button ${sortBy === 'date' ? 'active' : ''}`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('type')}
              className={`sort-button ${sortBy === 'type' ? 'active' : ''}`}
            >
              Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">Chargement des rapports...</div>
        ) : reports.length === 0 ? (
          <div className="no-reports-message">
            Aucun rapport disponible.
          </div>
        ) : (
          <div className="reports-list">
            {reports.map(report => (
              <div key={report._id} className="report-item">
                <div className="report-header">
                  <div className="report-title">
                    <FaFileAlt className="report-icon" />
                    <h3>{report.title}</h3>
                  </div>
                  <span className={`report-type ${report.type}`}>
                    {getReportTypeLabel(report.type)}
                  </span>
                </div>

                <div className="report-info">
                  <span>Localisation: {report.location}</span>
                  <span>Date: {formatDate(report.createdAt)}</span>
                  <span>Par: {report.author ? `${report.author.firstName} ${report.author.lastName}` : 'Auteur inconnu'}</span>
                </div>

                {selectedReport === report._id && (
                  <div className="report-content">
                    <div className="text-content">{report.content}</div>
                    <button
                      className="close-preview-button"
                      onClick={() => setSelectedReport(null)}
                    >
                      Fermer l'aperçu
                    </button>
                  </div>
                )}

                <div className="report-actions">
                  <button
                    className="action-button view"
                    onClick={() => setSelectedReport(selectedReport === report._id ? null : report._id)}
                  >
                    <FaEye /> {selectedReport === report._id ? 'Masquer' : 'Aperçu'}
                  </button>
                  <button
                    className="action-button download"
                    onClick={() => handleDownload(report)}
                  >
                    <FaDownload /> Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="button-group">
          <button onClick={onClose} className="cancel-button">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReportsPage; 