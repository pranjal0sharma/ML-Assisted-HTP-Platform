import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

// A dedicated component for the thematic SVG Tree. This keeps the main component clean.
const ThematicTree = () => (
  <svg 
    viewBox="0 0 200 200" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ width: '100%', maxWidth: '280px', height: 'auto', margin: '0 auto 20px auto', display: 'block' }}
  >
    <path 
      d="M100 180 V 70 M100 70 C 80 70, 70 50, 50 50 M100 70 C 120 70, 130 50, 150 50 M50 50 C 30 50, 20 30, 40 20 M50 50 C 70 50, 70 30, 60 20 M150 50 C 170 50, 180 30, 160 20 M150 50 C 130 50, 130 30, 140 20"
      stroke="currentColor" 
      strokeWidth="5" 
      strokeLinecap="round"
      fill="none" 
    />
  </svg>
);


// Reusable component for form inputs
const FormInput = ({ label, type, name, value, onChange, placeholder, disabled }) => (
  <div className="form-group">
    <label htmlFor={name} className="form-label">{label}</label>
    <input
      id={name}
      type={type}
      name={name}
      className="form-input"
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      required
      disabled={disabled}
      autoComplete={type === 'password' ? 'current-password' : name}
    />
  </div>
);


function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData);
    } catch (err) {
      setError('Login failed. Please check your username and password.');
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* --- Left Panel with Thematic Visual and Text --- */}
        <div className="login-left" style={{ textAlign: 'center' }}>
          <ThematicTree />
          <div className="login-brand">
            <h1>HTP Interpretation Platform</h1>
            <p className="brand-subtitle">
              A digital workspace for structured psychological assessment.
            </p>
          </div>
        </div>

        {/* --- Right Panel (Login Form) --- */}
        <div className="login-right">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <FormInput
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                disabled={isLoading}
              />
              <FormInput
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
              />

              {error && (
                <p style={{ color: '#D32F2F', textAlign: 'center', marginTop: '-10px', fontSize: '0.9rem' }}>
                  {error}
                </p>
              )}

              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner" style={{ marginRight: '8px' }}></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="login-footer">
              <p className="help-text">
                Need help? Contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;