import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

const ROLES = ['Super Admin', 'Admin', 'Viewer'];
const ACCESS_OPTIONS = ['Full', 'View Only'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'Viewer',
    access: 'View Only',
  });
  const navigate = useNavigate();
  const [popupRole, setPopupRole] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Get user role from JWT
  let userRole = '';
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch {}
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://10.1.4.63:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      if (err.response && err.response.status === 403) {
        navigate('/dashboard'); // Not admin, redirect
      }
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://10.1.4.63:5000/api/users/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSummary();
    // eslint-disable-next-line
  }, []);

  const handleRoleChange = async (id, newRole) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://10.1.4.63:5000/api/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Role updated');
      fetchUsers();
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://10.1.4.63:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User deleted');
      fetchUsers();
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://10.1.4.63:5000/api/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User added');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', username: '', password: '', role: 'Viewer', access: 'View Only' });
      fetchUsers();
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleEdit = (user) => {
    setEditUser({ ...user, password: '' }); // Don't prefill password
    setShowAddModal(false);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const updateData = { ...editUser };
      if (!updateData.password) delete updateData.password; // Don't send empty password
      await axios.patch(`http://10.1.4.63:5000/api/users/${editUser._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User updated');
      setEditUser(null);
      fetchUsers();
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Add this function for resetting newUser
  const initialNewUser = {
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'Viewer',
    access: 'View Only',
  };

  return (
    <div className="issues-container">
      <div className="dashboard-header">
        <h1>Administrators</h1>
        <div className="header-actions">
          {userRole === 'Super Admin' && (
            <button
              onClick={() => {
                setNewUser(initialNewUser);
                setShowAddModal(true);
                setEditUser(null);
              }}
              className="btn-add-issue"
            >
              <i className="fas fa-user-plus"></i> Add New User
            </button>
          )}
        </div>
      </div>

      {/* Role summary cards */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        {ROLES.map((role) => (
          <div
            key={role}
            className={`admin-summary-card${selectedRole === role ? ' selected' : ''}`}
            onClick={() => setSelectedRole(selectedRole === role ? null : role)}
            style={{ cursor: 'pointer' }}
          >
            <span className="admin-summary-icon">
              {role === 'Super Admin' ? '🛡️' : role === 'Admin' ? '👨‍💼' : '👁️'}
            </span>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{summary[role] || 0} ACCOUNTS</div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{role}</div>
            <div style={{ fontSize: 13, color: '#3498db', marginTop: 4 }}>Default Permissions</div>
          </div>
        ))}
      </div>

      {error && <div className="admin-message-error">{error}</div>}
      {success && <div className="admin-message-success">{success}</div>}

      {/* User Table - Restored Styling with Scroll */}
      <div className="issues-table-container">
        <div className="users-table-scroll">
          <table className="issues-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Access</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(selectedRole ? users.filter(user => user.role === selectedRole) : users).map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={user.role === 'Super Admin' && users.filter(u => u.role === 'Super Admin').length === 1}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td>{user.access}</td>
                  <td>{user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : ''}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(user)} title="Edit User">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(user._id)} title="Delete User">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editUser) && (
        <div className="issue-form-popup-overlay">
          <form onSubmit={editUser ? handleEditUser : handleAddUser} className="issue-form-popup" autoComplete="off">
            <div className="form-header">
              <h2>{editUser ? 'Edit User' : 'Add New User'}</h2>
              <button type="button" className="btn-close" onClick={() => { setShowAddModal(false); setEditUser(null); setNewUser(initialNewUser); }} title="Close Form">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="new-name"
                  value={editUser ? editUser.name : newUser.name}
                  onChange={editUser ? (e) => setEditUser({ ...editUser, name: e.target.value }) : (e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="new-email"
                  value={editUser ? editUser.email : newUser.email}
                  onChange={editUser ? (e) => setEditUser({ ...editUser, email: e.target.value }) : (e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="new-username"
                  value={editUser ? editUser.username : newUser.username}
                  onChange={editUser ? (e) => setEditUser({ ...editUser, username: e.target.value }) : (e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="new-password"
                  value={editUser ? editUser.password : newUser.password}
                  onChange={editUser ? (e) => setEditUser({ ...editUser, password: e.target.value }) : (e) => setNewUser({ ...newUser, password: e.target.value })}
                  required={!editUser}
                  placeholder={editUser ? 'Leave blank to keep unchanged' : ''}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={editUser ? editUser.role : newUser.role}
                  onChange={editUser ? (e) => setEditUser({ ...editUser, role: e.target.value }) : (e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Access</label>
                <select
                  name="access"
                  value={editUser ? editUser.access : newUser.access}
                  onChange={editUser ? (e) => setEditUser({ ...editUser, access: e.target.value }) : (e) => setNewUser({ ...newUser, access: e.target.value })}
                >
                  {ACCESS_OPTIONS.map((access) => (
                    <option key={access} value={access}>{access}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editUser ? 'Update User' : 'Add User'}</button>
              <button type="button" className="btn-secondary" onClick={() => { setShowAddModal(false); setEditUser(null); setNewUser(initialNewUser); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 