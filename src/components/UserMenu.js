import React, { useState } from 'react';
import { FaStar, FaFlag, FaFileAlt, FaUser, FaClipboardList } from 'react-icons/fa';
import './UserMenu.css';
import RatingPage from '../pages/RatingPage';
import ReportProblemPage from '../pages/ReportProblemPage';
import ViewReportsPage from '../pages/ViewReportsPage';
import GenerateReportPage from '../pages/GenerateReportPage';
import MyReportsPage from '../pages/MyReportsPage';

const UserMenu = ({ user, isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(null);

  const handleMenuClick = (page) => {
    setCurrentPage(page);
  };

  const handleClosePage = () => {
    setCurrentPage(null);
  };

  if (!isOpen || !user) return null;

  return (
    <>
      <div className="user-menu">
        <div className="user-menu-header">
          <FaUser /> {user.firstName} {user.lastName}
        </div>
        
        <div className="user-menu-content">
          <div className="menu-item" onClick={() => handleMenuClick('rating')}>
            <FaStar /> Noter la plateforme
          </div>

          <div className="menu-item" onClick={() => handleMenuClick('report')}>
            <FaFlag /> Signaler un problème
          </div>

          <div className="menu-item" onClick={() => handleMenuClick('view-reports')}>
            <FaFileAlt /> Voir les rapports
          </div>

          {user.role === 'meteorologist' && (
            <>
              <div className="menu-item" onClick={() => handleMenuClick('generate-report')}>
                <FaFileAlt /> Créer un rapport
              </div>
              <div className="menu-item" onClick={() => handleMenuClick('my-reports')}>
                <FaClipboardList /> Mes rapports
              </div>
            </>
          )}
        </div>
      </div>

      {currentPage === 'rating' && (
        <RatingPage onClose={handleClosePage} user={user} />
      )}

      {currentPage === 'report' && (
        <ReportProblemPage onClose={handleClosePage} user={user} />
      )}

      {currentPage === 'view-reports' && (
        <ViewReportsPage onClose={handleClosePage} user={user} />
      )}

      {currentPage === 'generate-report' && user.role === 'meteorologist' && (
        <GenerateReportPage onClose={handleClosePage} user={user} />
      )}

      {currentPage === 'my-reports' && user.role === 'meteorologist' && (
        <MyReportsPage onClose={handleClosePage} user={user} />
      )}
    </>
  );
};

export default UserMenu; 