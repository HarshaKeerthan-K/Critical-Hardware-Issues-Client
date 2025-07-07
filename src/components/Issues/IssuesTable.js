import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import DashboardStats from '../Dashboard/DashboardStats';
import FilterBar from './FilterBar';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import './IssuesTable.css';

// Sample team members - replace with your actual team members
const TEAM_MEMBERS = [
  'John Doe',
  'Jane Smith',
  'Mike Johnson',
  'Sarah Williams',
  'David Brown'
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

const IssuesTable = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    critical: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    dateRange: { start: null, end: null },
    priority: '',
    assignedTo: '',
    status: ''
  });
  const [newIssue, setNewIssue] = useState({
    productName: '',
    serialNo: '',
    leadId: '',
    clientName: '',
    issueDescription: '',
    issueReportedDate: new Date(),
    supportTeamReceivedDate: new Date(),
    callTakenBy: '',
    deviceReceivedInDallas: false,
    assignedTo: '',
    assignedDate: new Date(),
    targetCompletionDate: new Date(),
    rca: '',
    status: 'Open',
    priority: 'Medium',
    technician: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [newTeamMember, setNewTeamMember] = useState('');
  const [showTeamMemberForm, setShowTeamMemberForm] = useState(false);
  const [showRcaPopup, setShowRcaPopup] = useState(false);
  const [selectedRca, setSelectedRca] = useState('');
  const navigate = useNavigate();

  // Get user role from JWT
  let userRole = '';
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch {}
  }

  // Fetch issues and team members
  useEffect(() => {
    fetchIssues();
    fetchTeamMembers();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchIssues();
      fetchTeamMembers();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Update stats when issues change
  useEffect(() => {
    updateStats();
  }, [issues]);

  // Apply filters when issues or filters change
  useEffect(() => {
    applyFilters();
  }, [issues, filters]);

  const fetchIssues = async () => {
    try {
      const response = await axios.get('http://10.1.4.63:5000/api/issues', getAuthHeaders());
      setIssues(response.data);
      
    } catch (error) {
      console.error('Error fetching issues:', error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        alert('Authentication failed. Please log in again.');
        // Optionally redirect to login page
        // navigate('/login'); 
      }
    }
  };

  const fetchTeamMembers = async () => {
    try {
      console.log('Fetching team members...');
      const response = await axios.get('http://10.1.4.63:5000/api/team-members', getAuthHeaders());
      console.log('Fetched team members:', response.data);
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error.response?.data || error.message);
      alert('Failed to fetch team members: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateStats = () => {
    const newStats = {
      total: issues.length,
      open: issues.filter(issue => issue.status === 'Open').length,
      inProgress: issues.filter(issue => issue.status === 'In Progress').length,
      completed: issues.filter(issue => issue.status === 'Completed').length,
      critical: issues.filter(issue => 
        issue.status === 'Critical' || issue.priority === 'Critical'
      ).length
    };
    setStats(newStats);
  };

  const applyFilters = () => {
    let filtered = [...issues];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(issue => 
        Object.values(issue).some(value => 
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.issueReportedDate);
        return issueDate >= filters.dateRange.start && 
               issueDate <= filters.dateRange.end;
      });
    }

    if (filters.priority) {
      filtered = filtered.filter(issue => issue.priority === filters.priority);
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(issue => issue.assignedTo === filters.assignedTo);
    }

    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    setFilteredIssues(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewIssue(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, field) => {
    setNewIssue(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`http://10.1.4.63:5000/api/issues/${editingId}`, newIssue, getAuthHeaders());
      } else {
        await axios.post('http://10.1.4.63:5000/api/issues', newIssue, getAuthHeaders());
      }
      fetchIssues();
      setNewIssue({
        productName: '',
        serialNo: '',
        leadId: '',
        clientName: '',
        issueDescription: '',
        issueReportedDate: new Date(),
        supportTeamReceivedDate: new Date(),
        callTakenBy: '',
        deviceReceivedInDallas: false,
        assignedTo: '',
        assignedDate: new Date(),
        targetCompletionDate: new Date(),
        rca: '',
        status: 'Open',
        priority: 'Medium',
        technician: ''
      });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving issue:', error.response?.data || error.message);
    }
  };

  const handleEdit = (issue) => {
    console.log('Issue being edited:', issue);
    const parseDate = (dateString) => {
      if (!dateString) return new Date(); 
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? new Date() : date; 
    };

    setNewIssue({
      ...issue,
      issueReportedDate: parseDate(issue.issueReportedDate),
      supportTeamReceivedDate: parseDate(issue.supportTeamReceivedDate),
      assignedDate: parseDate(issue.assignedDate),
      targetCompletionDate: parseDate(issue.targetCompletionDate),
      assignedTo: issue.assignedTo && typeof issue.assignedTo === 'object'
        ? (console.log('Transforming assignedTo object to name:', issue.assignedTo.name), issue.assignedTo.name)
        : (console.log('Using assignedTo as is:', issue.assignedTo), issue.assignedTo || ''), 
    });
    console.log('New issue state after handleEdit:', newIssue);
    setEditingId(issue._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://10.1.4.63:5000/api/issues/${id}`, getAuthHeaders());
      fetchIssues();
    } catch (error) {
      console.error('Error deleting issue:', error.response?.data || error.message);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setNewIssue({
      productName: '',
      serialNo: '',
      leadId: '',
      clientName: '',
      issueDescription: '',
      issueReportedDate: new Date(),
      supportTeamReceivedDate: new Date(),
      callTakenBy: '',
      deviceReceivedInDallas: false,
      assignedTo: '',
      assignedDate: new Date(),
      targetCompletionDate: new Date(),
      rca: '',
      status: 'Open',
      priority: 'Medium',
      technician: ''
    });
  };

  const exportToExcel = () => {
    try {
      const dataToExport = filteredIssues.map(issue => ({
        'Product Name': issue.productName,
        'Serial Number': issue.serialNo,
        'Lead ID': issue.leadId,
        'Client Name': issue.clientName,
        'Issue Description': issue.issueDescription,
        'Issue Reported Date': new Date(issue.issueReportedDate).toLocaleDateString(),
        'Support Team Received Date': new Date(issue.supportTeamReceivedDate).toLocaleDateString(),
        'Call Taken By': issue.callTakenBy,
        'Device Received in Dallas': issue.deviceReceivedInDallas ? 'Yes' : 'No',
        'Assigned To': issue.assignedTo,
        'Assigned Date': new Date(issue.assignedDate).toLocaleDateString(),
        'Target Completion Date': new Date(issue.targetCompletionDate).toLocaleDateString(),
        'RCA': issue.rca,
        'Status': issue.status,
        'Priority': issue.priority,
        'Created At': new Date(issue.createdAt).toLocaleString(),
        'Updated At': new Date(issue.updatedAt).toLocaleString(),
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Issues");
      XLSX.writeFile(wb, "Hardware_Issues_Dashboard.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const handleAddTeamMember = async () => {
    if (newTeamMember.trim() === '') return;
    try {
      console.log('Attempting to add team member:', newTeamMember);
      const response = await axios.post('http://10.1.4.63:5000/api/team-members', { name: newTeamMember }, getAuthHeaders());
      console.log('Add team member response:', response.data);
      setTeamMembers([...teamMembers, response.data]);
      setNewTeamMember('');
    } catch (error) {
      console.error('Error adding team member:', error.response?.data || error.message);
      alert('Failed to add team member: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditTeamMember = async (oldName, newName) => {
    if (newName.trim() === '') return;
    try {
      const memberToUpdate = teamMembers.find(member => member.name === oldName);
      if (!memberToUpdate) {
        console.error('Member to update not found:', oldName);
        return;
      }
      const response = await axios.put(`http://10.1.4.63:5000/api/team-members/${memberToUpdate._id}`, { name: newName }, getAuthHeaders());
      setTeamMembers(teamMembers.map(member => 
        member.name === oldName ? { ...member, name: newName } : member
      ));
      setEditingTeamMember(null);
    } catch (error) {
      console.error('Error editing team member:', error.response?.data || error.message);
      alert('Failed to edit team member: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTeamMember = async (memberToDelete) => {
    try {
      await axios.delete(`http://10.1.4.63:5000/api/team-members/${memberToDelete._id}`, getAuthHeaders());
      setTeamMembers(teamMembers.filter(member => member._id !== memberToDelete._id));
    } catch (error) {
      console.error('Error deleting team member:', error.response?.data || error.message);
      alert('Failed to delete team member: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRcaClick = (rca) => {
    setSelectedRca(rca);
    setShowRcaPopup(true);
  };

  const handleRcaHeaderClick = (rca) => {
    setSelectedRca(rca);
    setShowRcaPopup(true);
  };

  // Add this useEffect to log team members changes
  useEffect(() => {
    console.log('Team members updated:', teamMembers);
  }, [teamMembers]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="issues-container">
      <div className="dashboard-header">
        <h1>Critical Hardware Issues Dashboard</h1>
        <div className="header-actions">
          {(userRole === 'Super Admin' || userRole === 'Admin') && (
            <button
              className="btn-admin-link"
              onClick={() => navigate('/admin/users')}
              style={{ background: 'none', border: '1px solid #3498db', color: '#3498db', borderRadius: 5, padding: '8px 16px', marginRight: 12, cursor: 'pointer', fontWeight: 500 }}
            >
              Admin
            </button>
          )}
          {userRole === 'Super Admin' && (
            <button 
              className="btn-add-issue"
              onClick={() => setShowForm(true)}
              title="Add New Hardware Issue"
            >
              <i className="fas fa-plus"></i> Add Hardware Issue
            </button>
          )}
          <button 
            className="btn-export-excel"
            onClick={exportToExcel}
            title="Export to Excel"
          >
            <i className="fas fa-file-excel"></i> Export to Excel
          </button>
          {userRole === 'Super Admin' && (
            <button 
              className="btn-manage-team"
              onClick={() => setShowTeamMemberForm(true)}
              title="Manage Assignees"
            >
              <i className="fas fa-users"></i> Manage Assignees
            </button>
          )}
          <button 
            className="btn-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <i className="fas fa-power-off"></i>
          </button>
        </div>
      </div>
      
      {/* Team Member Management Modal */}
      {showTeamMemberForm && userRole === 'Super Admin' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Manage Assignees</h2>
              <button 
                className="btn-close"
                onClick={() => setShowTeamMemberForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="team-member-list">
              {teamMembers.map((member, index) => (
                <div key={member._id} className="team-member-item">
                  {editingTeamMember === member ? (
                    <div className="edit-team-member">
                      <input
                        type="text"
                        value={newTeamMember}
                        onChange={(e) => setNewTeamMember(e.target.value)}
                        placeholder="Enter new name"
                      />
                      <button 
                        onClick={() => handleEditTeamMember(member.name, newTeamMember)}
                        className="btn-save"
                      >
                        <i className="fas fa-save"></i>
                      </button>
                      <button 
                        onClick={() => {
                          setEditingTeamMember(null);
                          setNewTeamMember('');
                        }}
                        className="btn-cancel"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="team-member-display">
                      <span>{member.name}</span>
                      <div className="team-member-actions">
                        {userRole === 'Super Admin' && (
                          <>
                            <button 
                              onClick={() => {
                                setEditingTeamMember(member);
                                setNewTeamMember(member.name);
                              }}
                              className="btn-edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleDeleteTeamMember(member)}
                              className="btn-delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="add-team-member">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddTeamMember();
              }}>
                <input
                  type="text"
                  value={newTeamMember}
                  onChange={(e) => setNewTeamMember(e.target.value)}
                  placeholder="Enter new team member name"
                />
                <button 
                  type="submit"
                  className="btn-add"
                >
                  <i className="fas fa-plus"></i> Add Member
                </button>
              </form>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowTeamMemberForm(false)}
                className="btn-close-modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <DashboardStats stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        teamMembers={teamMembers}
      />

      {showForm && ((userRole === 'Super Admin') || (userRole === 'Admin' || userRole === 'Viewer')) && (
        <div className="issue-form-popup-overlay">
          <form onSubmit={handleSubmit} className="issue-form-popup">
            <div className="form-header">
              <h2>{editingId ? (userRole === 'Super Admin' ? 'Edit Issue' : 'View Issue') : 'Add New Issue'}</h2>
              <button 
                type="button" 
                className="btn-close"
                onClick={handleCancel}
                title="Close Form"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={newIssue.productName}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Serial No</label>
                <input
                  type="text"
                  name="serialNo"
                  value={newIssue.serialNo}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Lead ID</label>
                <input
                  type="text"
                  name="leadId"
                  value={newIssue.leadId}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={newIssue.clientName}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Issue Description</label>
                <textarea
                  name="issueDescription"
                  value={newIssue.issueDescription}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Issue Reported Date</label>
                <DatePicker
                  selected={newIssue.issueReportedDate}
                  onChange={(date) => handleDateChange(date, 'issueReportedDate')}
                  dateFormat="dd-MM-yyyy"
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Technician</label>
                <input
                  type="text"
                  name="technician"
                  value={newIssue.technician}
                  onChange={handleInputChange}
                  required={false}
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Support Team Received Date</label>
                <DatePicker
                  selected={newIssue.supportTeamReceivedDate}
                  onChange={(date) => handleDateChange(date, 'supportTeamReceivedDate')}
                  dateFormat="dd-MM-yyyy"
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Call Taken By</label>
                <input
                  type="text"
                  name="callTakenBy"
                  value={newIssue.callTakenBy}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Device Received in Dallas</label>
                <input
                  type="checkbox"
                  name="deviceReceivedInDallas"
                  checked={newIssue.deviceReceivedInDallas}
                  onChange={handleInputChange}
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Assigned To</label>
                <select
                  name="assignedTo"
                  value={newIssue.assignedTo}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                >
                  <option value="">Select Assignee</option>
                  {teamMembers.map((member) => (
                    <option key={member._id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Date</label>
                <DatePicker
                  selected={newIssue.assignedDate}
                  onChange={(date) => handleDateChange(date, 'assignedDate')}
                  dateFormat="dd-MM-yyyy"
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Target Completion Date</label>
                <DatePicker
                  selected={newIssue.targetCompletionDate}
                  onChange={(date) => handleDateChange(date, 'targetCompletionDate')}
                  dateFormat="dd-MM-yyyy"
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>RCA</label>
                <textarea
                  name="rca"
                  value={newIssue.rca}
                  onChange={handleInputChange}
                  disabled={userRole !== 'Super Admin' && editingId}
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={newIssue.priority}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={newIssue.status}
                  onChange={handleInputChange}
                  required
                  disabled={userRole !== 'Super Admin' && editingId}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              {userRole === 'Super Admin' && (
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Issue' : 'Add Issue'}
                </button>
              )}
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Issues Heading */}
      <h2 className="issues-heading">Issues</h2>

      {/* Issues Table - Restored Styling with Both Scrolls */}
      <div className="issues-table-container">
        <div className="users-table-scroll">
          <table className="issues-table">
            <thead>
              <tr>
                <th>PRODUCT DETAILS</th>
                <th>CLIENT DETAILS</th>
                <th>REPORTED DATE</th>
                <th>TECHNICIAN</th>
                <th>SUPPORT DETAILS</th>
                <th>ISSUE DESCRIPTION</th>
                <th>DEVICE RECEIVED</th>
                <th>ASSIGNED TO</th>
                <th>ASSIGNED DATE</th>
                <th>TARGET DATE</th>
                <th>RCA</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(issue => (
                <tr key={issue._id}>
                  <td>
                    <strong>{issue.productName}</strong><br />
                    <small>{issue.serialNo}</small>
                  </td>
                  <td>
                    <strong>{issue.leadId}</strong><br />
                    <small>{issue.clientName}</small>
                  </td>
                  <td>{new Date(issue.issueReportedDate).toLocaleDateString()}</td>
                  <td>{issue.technician || '-'}</td>
                  <td>
                    {new Date(issue.supportTeamReceivedDate).toLocaleDateString()}<br />
                    <small>{issue.callTakenBy}</small>
                  </td>
                  <td>
                    {issue.issueDescription ? (
                      <span className="issue-description-red">
                        {issue.issueDescription}
                      </span>
                    ) : ''}
                  </td>
                  <td>
                    {issue.deviceReceivedInDallas ? (
                      <span className="device-received-pill">YES</span>
                    ) : 'NO'}
                  </td>
                  <td>
                    {issue.assignedTo}<br />
                    <small>Engineer</small>
                  </td>
                  <td>{new Date(issue.assignedDate).toLocaleDateString()}</td>
                  <td>{new Date(issue.targetCompletionDate).toLocaleDateString()}</td>
                  <td>{
                    issue.rca ? (
                      <span
                        className="rca-preview"
                        onClick={() => {
                          setSelectedRca(issue.rca);
                          setShowRcaPopup(true);
                        }}
                        title="Click to view full RCA"
                      >
                        {issue.rca}
                      </span>
                    ) : ''
                  }</td>
                  <td>
                    <span className={`priority-pill priority-${issue.priority.toLowerCase()}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${issue.status.toLowerCase().replace(/ /g, '-')}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td>
                    {userRole === 'Super Admin' && (
                      <>
                        <button 
                          onClick={() => handleEdit(issue)}
                          className="btn-edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(issue._id)}
                          className="btn-delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                    {(userRole === 'Admin' || userRole === 'Viewer') && (
                      <button
                        onClick={() => {
                          setNewIssue({
                            ...issue,
                            issueReportedDate: new Date(issue.issueReportedDate),
                            supportTeamReceivedDate: new Date(issue.supportTeamReceivedDate),
                            assignedDate: new Date(issue.assignedDate),
                            targetCompletionDate: new Date(issue.targetCompletionDate),
                          });
                          setEditingId(issue._id);
                          setShowForm(true);
                        }}
                        className="btn-view"
                        title="View Issue"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add RCA Popup */}
      {showRcaPopup && (
        <div className="rca-popup-overlay" onClick={() => setShowRcaPopup(false)}>
          <div className="rca-popup" onClick={e => e.stopPropagation()}>
            <div className="rca-popup-header">
              <h3>Root Cause Analysis</h3>
              <button 
                className="btn-close"
                onClick={() => setShowRcaPopup(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="rca-popup-content">
              {selectedRca}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesTable; 