import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaSort, FaFilter } from 'react-icons/fa';
import './Pages.css';

const ViewReportsPage = ({ onClose, user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
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
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error);
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

  return (
    <div className="page-container">
      <div className="page-content">
        <h2>Rapports</h2>
        
        <div className="reports-controls">
          <div className="filter-section">
            <label htmlFor="filter">Filtrer par:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous</option>
              <option value="bug">Bugs techniques</option>
              <option value="data">Données météo</option>
              <option value="feature">Suggestions</option>
              <option value="other">Autres</option>
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
          <div className="loading">Chargement des rapports...</div>
        ) : (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report._id} className="report-card">
                <div className="report-header">
                  <h3>{report.title}</h3>
                  <span className={`report-type ${report.type}`}>
                    {report.type}
                  </span>
                </div>
                <p className="report-description">{report.description}</p>
                <div className="report-footer">
                  <span className="report-date">
                    {new Date(report.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="report-author">
                    Par: {report.author.firstName} {report.author.lastName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="button-group">
          <button onClick={onClose} className="close-button">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReportsPage; 