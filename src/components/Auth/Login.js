import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [registerCredentials, setRegisterCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgotPassword'
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterCredentials({
      ...registerCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axios.post('http://10.1.4.63:5000/api/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (registerCredentials.password !== registerCredentials.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const registerResponse = await axios.post('http://10.1.4.63:5000/api/auth/register', {
        username: registerCredentials.username,
        password: registerCredentials.password,
      });
      setSuccessMessage(registerResponse.data.message || 'Registration successful! Please log in.');
      setCurrentView('login'); // Automatically switch to login after successful registration
      setRegisterCredentials({ username: '', password: '', confirmPassword: '' }); // Clear form
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      // This is a placeholder. In a real app, you'd send an email with a reset link.
      // For now, we'll just simulate success or failure.
      const forgotResponse = await axios.post('http://10.1.4.63:5000/api/auth/forgot-password', { email: forgotPasswordEmail });
      setSuccessMessage(forgotResponse.data.message || 'Password reset instructions sent to your email.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset instructions. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Hardware Issues Dashboard</h1>
          <p>Please {currentView === 'login' ? 'login' : currentView === 'register' ? 'sign up' : 'reset your password'} to continue</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {currentView === 'login' && (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            <p className="auth-link" onClick={() => setCurrentView('register')}>Don't have an account? Sign Up</p>
            <p className="auth-link" onClick={() => setCurrentView('forgotPassword')}>Forgot Password?</p>
          </form>
        )}

        {currentView === 'register' && (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="register-username">Username</label>
              <input
                type="text"
                id="register-username"
                name="username"
                value={registerCredentials.username}
                onChange={handleRegisterChange}
                required
                placeholder="Choose a username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                type="password"
                id="register-password"
                name="password"
                value={registerCredentials.password}
                onChange={handleRegisterChange}
                required
                placeholder="Choose a password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                value={registerCredentials.confirmPassword}
                onChange={handleRegisterChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="login-button">
              Sign Up
            </button>

            <p className="auth-link" onClick={() => setCurrentView('login')}>Already have an account? Login</p>
          </form>
        )}

        {currentView === 'forgotPassword' && (
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <input
                type="email"
                id="forgot-email"
                name="email"
                value={forgotPasswordEmail}
                onChange={handleForgotPasswordChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            <button type="submit" className="login-button">
              Send Reset Link
            </button>

            <p className="auth-link" onClick={() => setCurrentView('login')}>Back to Login</p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login; 