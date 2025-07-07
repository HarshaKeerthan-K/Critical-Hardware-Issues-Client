import React from 'react';
import './DashboardStats.css';

const DashboardStats = ({ stats }) => {
  return (
    <div className="dashboard-stats">
      <div className="stat-card total">
        <i className="fas fa-wrench"></i>
        <h3>Total Hardware Issues</h3>
        <p>{stats.total}</p>
      </div>
      
      <div className="stat-card open">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Open</h3>
        <p>{stats.open}</p>
      </div>
      
      <div className="stat-card in-progress">
        <i className="fas fa-clock"></i>
        <h3>In Progress</h3>
        <p>{stats.inProgress}</p>
      </div>
      
      <div className="stat-card completed">
        <i className="fas fa-check-circle"></i>
        <h3>Completed</h3>
        <p>{stats.completed}</p>
      </div>
      
      <div className="stat-card critical">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Critical</h3>
        <p>{stats.critical}</p>
      </div>
    </div>
  );
};

export default DashboardStats; 