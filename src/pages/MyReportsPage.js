import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaTrash, FaEye, FaFilePdf } from 'react-icons/fa';
import './Pages.css';

const MyReportsPage = ({ onClose, user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filtrer pour n'afficher que les rapports de l'utilisateur connecté
        setReports(data.filter(report => report.author._id === user.id));
      } else {
        throw new Error('Erreur lors de la récupération des rapports');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setReports(reports.filter(report => report._id !== reportId));
      } else {
        throw new Error('Erreur lors de la suppression du rapport');
      }
    } catch (error) {
      setError(error.message);
    }
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
        <h2>Mes Rapports Météorologiques</h2>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-message">Chargement des rapports...</div>
        ) : reports.length === 0 ? (
          <div className="no-reports-message">
            Vous n'avez pas encore créé de rapports.
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
                  <span>Créé le: {formatDate(report.createdAt)}</span>
                </div>

                {selectedReport === report._id ? (
                  <div className="report-content">
                    {report.content ? (
                      <div className="text-content">{report.content}</div>
                    ) : report.fileUrl ? (
                      <div className="pdf-viewer">
                        <iframe
                          src={`http://localhost:5000${report.fileUrl}`}
                          title={report.title}
                          width="100%"
                          height="500px"
                        />
                      </div>
                    ) : null}
                    <button
                      className="close-preview-button"
                      onClick={() => setSelectedReport(null)}
                    >
                      Fermer l'aperçu
                    </button>
                  </div>
                ) : null}

                <div className="report-actions">
                  <button
                    className="action-button view"
                    onClick={() => setSelectedReport(report._id)}
                  >
                    <FaEye /> Voir
                  </button>
                  {report.fileUrl && (
                    <a
                      href={`http://localhost:5000${report.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-button download"
                    >
                      <FaFilePdf /> PDF
                    </a>
                  )}
                  <button
                    className="action-button delete"
                    onClick={() => handleDelete(report._id)}
                  >
                    <FaTrash /> Supprimer
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

export default MyReportsPage; 