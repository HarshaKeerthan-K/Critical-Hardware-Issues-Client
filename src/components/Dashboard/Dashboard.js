import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Overview</h1>
      </div>
      
      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">1,234</p>
          <p className="stat-change positive">+12% from last month</p>
        </div>

        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-number">$45,678</p>
          <p className="stat-change positive">+8% from last month</p>
        </div>

        <div className="stat-card">
          <h3>Active Projects</h3>
          <p className="stat-number">23</p>
          <p className="stat-change negative">-2% from last month</p>
        </div>

        <div className="stat-card">
          <h3>Tasks Completed</h3>
          <p className="stat-number">89</p>
          <p className="stat-change positive">+15% from last month</p>
        </div>

        {/* Charts Section */}
        <div className="chart-container">
          <h3>Monthly Overview</h3>
          <div className="chart-placeholder">
            Chart will be displayed here
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-container">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            <li>
              <span className="activity-time">10:30 AM</span>
              <span className="activity-text">New user registration</span>
            </li>
            <li>
              <span className="activity-time">09:45 AM</span>
              <span className="activity-text">Project milestone completed</span>
            </li>
            <li>
              <span className="activity-time">09:15 AM</span>
              <span className="activity-text">New task assigned</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 